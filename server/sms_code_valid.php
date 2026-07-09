<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$queueDir = __DIR__ . '/queue/';

/* =====================================================
   Validate required request parameters
   -----------------------------------------------------
   Expected GET parameters:
   - to  : Phone number used to identify the queue file
   - key : Unique participant identifier
===================================================== */

$to  = isset($_GET['to'])  ? trim($_GET['to'])  : '';
$key = isset($_GET['key']) ? trim($_GET['key']) : '';

if (!$to || !$key) {
    http_response_code(400);
    die(json_encode([
        "success" => false,
        "message" => "The parameters ?to and ?key are required."
    ]));
}

$queueFile = $queueDir . $to . '.csv';

/* =====================================================
   Validate queue file
   -----------------------------------------------------
   Each phone number is associated with exactly one queue
   file. The requested file must exist before it can be
   updated.
===================================================== */

if (!file_exists($queueFile)) {
    http_response_code(404);
    die(json_encode([
        "success" => false,
        "message" => "No queue file was found for the specified phone number."
    ]));
}

/* =====================================================
   Read queue file
   -----------------------------------------------------
   Load the complete queue file into memory so that the
   participant information can be validated and updated.
===================================================== */

$lines = array_map(function($line) {
    return str_getcsv($line, ",", '"', "\\");
}, file($queueFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));

if (empty($lines)) {
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "message" => "The queue file is empty or invalid."
    ]));
}

/* =====================================================
   Validate participant key
   -----------------------------------------------------
   The first row stores the participant information:

       language,key,code,bool1,bool2

   The provided key must match the stored key before the
   second processing flag can be updated.
===================================================== */

$first = $lines[0];
$existingKey = $first[1] ?? null;

if ($existingKey !== $key) {
    http_response_code(409);
    die(json_encode([
        "success" => false,
        "message" => "The provided key does not match the queue file."
    ]));
}

/*
 * Mark the second processing step as completed.
 */
$lines[0][4] = 'true';

/* =====================================================
   Write updated queue file
   -----------------------------------------------------
   Overwrite the existing queue file with the updated
   participant status.
===================================================== */

$fp = fopen($queueFile, 'w');

foreach ($lines as $row) {
    fputcsv($fp, $row, ",", '"', "\\");
}

fclose($fp);

/* =====================================================
   Success response
===================================================== */

echo json_encode([
    "success" => true,
    "message" => "Code confirmed. The second status flag has been set to true.",
    "file" => basename($queueFile)
]);
?>