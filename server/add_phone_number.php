<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$queueDir = __DIR__ . '/queue/';
$dbFiles = [
    __DIR__ . '/database/database.csv',
    __DIR__ . '/database/database_demo.csv'
];

/* =====================================================
   Validate required request parameters
   -----------------------------------------------------
   Expected GET parameters:
   - to   : Phone number (must start with '+')
   - code : Verification or access code
   - key  : Unique participant identifier
===================================================== */

$to   = isset($_GET['to'])   ? trim($_GET['to'])   : '';
$code = isset($_GET['code']) ? trim($_GET['code']) : '';
$key  = isset($_GET['key'])  ? trim($_GET['key'])  : '';

if (!$to || !$code || !$key) {
    http_response_code(400);
    die(json_encode([
        "success" => false,
        "message" => "The parameters ?to, ?code and ?key are required."
    ]));
}

// Phone numbers must use the international format.
if ($to[0] !== '+') {
    http_response_code(400);
    die(json_encode([
        "success" => false,
        "message" => "The phone number must start with '+'."
    ]));
}

/* =====================================================
   Search the participant database
   -----------------------------------------------------
   Look through all configured database files until the
   requested key is found.

   Once found:
   - store the participant language
   - collect all markerTestTime entries
===================================================== */

$language = null;
$markerTimes = [];

foreach ($dbFiles as $dbFile) {
    if (!file_exists($dbFile)) continue;

    if (($handle = fopen($dbFile, "r")) !== false) {
        while (($data = fgetcsv($handle, 0, ",", '"', "\\")) !== false) {
            if (count($data) < 6) continue;

            // Column 4 contains the participant key.
            if (trim($data[4]) === $key) {

                // Column 1 stores the preferred language.
                $language = trim($data[1]);

                // Search the row for every markerTestTime field.
                // Every valid timestamp is stored for later queue creation.
                for ($i = 0; $i < count($data) - 1; $i++) {
                    if (preg_match('/^markerTestTime/i', $data[$i])) {
                        $time = trim($data[$i + 1]);
                        if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $time)) {
                            $markerTimes[] = $time;
                        }
                    }
                }

                // Stop searching once the participant has been found.
                break 2;
            }
        }

        fclose($handle);
    }
}

if ($language === null) {
    http_response_code(404);
    die(json_encode([
        "success" => false,
        "message" => "The specified key was not found in the database."
    ]));
}

/* =====================================================
   Validate existing queue file
   -----------------------------------------------------
   Queue file structure:

   First row:
       language,key,code,bool1,bool2

   Remaining rows:
       language,scheduled_datetime,false

   Logic:
   - If the phone number already exists with the same key,
     only the code is updated.
   - If another key exists:
       • both booleans true  -> reject request
       • otherwise replace key and code while resetting
         both booleans.
===================================================== */

$queueFile = $queueDir . $to . '.csv';
$rows = [];

if (file_exists($queueFile)) {
    $existing = array_map(function($line) {
        return str_getcsv($line, ",", '"', "\\");
    }, file($queueFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));

    $firstLine = $existing[0] ?? [];
    $existingKey = $firstLine[1] ?? null;
    $bool1 = $firstLine[3] ?? 'false';
    $bool2 = $firstLine[4] ?? 'false';

    if ($existingKey === $key) {
        // Same participant: keep the existing state and only refresh the code.
        $rows[] = [$language, $key, $code, $bool1, $bool2];
    } else {
        // Another participant is already assigned to this phone number.
        if ($bool1 === 'true' && $bool2 === 'true') {
            http_response_code(409);

            die(json_encode([
                "success" => false,
                "message" => "This phone number is already assigned to another key and both status flags are set to true."
            ]));
        } else {
            // Replace participant while resetting both status flags.
            $rows[] = [$language, $key, $code, 'false', 'false'];
        }
    }
} else {
    /* -------------------------------------------------
       No queue file exists for this phone number.

       Check whether the participant key is already used
       by another phone number.

       If found:
       - second boolean false -> remove old queue
       - second boolean true  -> reject request
    -------------------------------------------------- */

    $otherFiles = glob($queueDir . '*');

    foreach ($otherFiles as $otherFile) {
        if (!is_file($otherFile)) continue;

        $otherLines = array_map(function($line) {
            return str_getcsv($line, ",", '"', "\\");
        }, file($otherFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));

        $otherFirst = $otherLines[0] ?? [];
        $otherKey = $otherFirst[1] ?? null;
        $otherBool2 = $otherFirst[4] ?? 'false';

        if ($otherKey === $key) {
            if ($otherBool2 === 'false') {
                // Participant changed phone number.
                // Remove the old queue before creating the new one.
                unlink($otherFile);
            } else {
                http_response_code(409);
                die(json_encode([
                    "success" => false,
                    "message" => "This key is already assigned to another queue and its second status flag is set to true."
                ]));
            }

            break;
        }
    }

    // Create a completely new queue.
    $rows[] = [$language, $key, $code, 'false', 'false'];
}

/* =====================================================
   Generate marker test entries
   -----------------------------------------------------
   The first scheduled marker test starts two days after
   registration.

   Every two markerTestTime entries belong to the same
   calendar day:
       1-2 -> Day +2
       3-4 -> Day +3
       5-6 -> Day +4
       ...
===================================================== */

$baseDate = new DateTime('+2 day');

foreach ($markerTimes as $index => $time) {
    $dayOffset = intdiv($index, 2);

    $dt = clone $baseDate;
    $dt->modify("+{$dayOffset} day");

    [$h, $m, $s] = explode(':', $time);

    $dt->setTime((int)$h, (int)$m, (int)$s);

    $rows[] = [$language, $dt->format('Y-m-d H:i:s'), 'false'];
}

/* =====================================================
   Write queue file
   -----------------------------------------------------
   Overwrite the queue file with the updated data and
   make it writable by all users/processes.
===================================================== */

$fp = fopen($queueFile, 'w');

foreach ($rows as $row) {
    fputcsv($fp, $row, ",", '"', "\\");
}

fclose($fp);
chmod($queueFile, 0666);

/* =====================================================
   Success response
===================================================== */

echo json_encode([
    "success" => true,
    "message" => "Queue updated successfully.",
    "file" => basename($queueFile),
    "entries" => count($rows)
]);
?>