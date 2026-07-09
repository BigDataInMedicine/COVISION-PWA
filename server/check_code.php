<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

// Database files
$filename = __DIR__ . '/database/database.csv';
$filenameDemo = __DIR__ . '/database/database_demo.csv';

/* =====================================================
   Read a CSV database file
   -----------------------------------------------------
   Each row is converted into an associative array.

   Fixed columns:
   - key
   - language
   - timestamp

   Remaining columns are interpreted as key/value pairs:
       fieldName1,value1,fieldName2,value2,...
===================================================== */

function readCsv($filename)
{
    if (!file_exists($filename)) {
        return [];
    }

    $handle = fopen($filename, "r");

    if (!$handle) {
        return [];
    }

    $dataArray = [];

    while (($line = fgetcsv($handle, 0, ",")) !== false) {
        $obj = [
            "key" => $line[0] ?? null,
            "language" => $line[1] ?? null,
            "timestamp" => $line[2] ?? null,
        ];

        // Convert the remaining columns into dynamic key/value pairs.
        $count = count($line);
        for ($i = 3; $i < $count; $i += 2) {
            $objKey = $line[$i] ?? null;
            $objValue = ($i + 1) < $count ? $line[$i + 1] : null;

            if ($objKey !== null && $objValue !== null) {
                $obj[$objKey] = $objValue;
            }
        }

        $dataArray[] = $obj;
    }

    fclose($handle);

    return $dataArray;
}

/* =====================================================
   Validate request parameters
   -----------------------------------------------------
   Expected GET parameter:
   - code : Marker identifier to search for
===================================================== */

$code = $_GET['code'] ?? null;

if ($code === null) {
    http_response_code(400);
    echo json_encode(["error" => "The required parameter 'code' is missing."]);
    exit;
}

/* =====================================================
   Search the production database
   -----------------------------------------------------
   The production database is searched first. If no
   matching marker identifier is found, the demo database
   is searched as a fallback.
===================================================== */

$dataArray = readCsv($filename);
$result = null;

foreach ($dataArray as $item) {
    if (
        isset($item['markerIdentifier']) &&
        $item['markerIdentifier'] === $code
    ) {
        $result = $item;
        break;
    }
}

/* =====================================================
   Search the demo database
   -----------------------------------------------------
   Only executed when no matching participant was found
   in the production database.
===================================================== */

if ($result === null) {
    $dataArrayDemo = readCsv($filenameDemo);

    foreach ($dataArrayDemo as $item) {
        if (
            isset($item['markerIdentifier']) &&
            $item['markerIdentifier'] === $code
        ) {
            $result = $item;
            break;
        }
    }
}

/* =====================================================
   Return the search result
   -----------------------------------------------------
   If no participant was found, return HTTP 404.
   Otherwise return the complete participant record
   as formatted JSON.
===================================================== */

if ($result === null) {
    http_response_code(404);

    echo json_encode([
        "error" => "No participant found for the specified code."
    ]);
} else {
    echo json_encode(
        $result,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
    );
}
?>