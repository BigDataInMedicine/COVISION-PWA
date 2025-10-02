<?php
/**
 * API Endpoint: Check Test Code
 *
 * Validates a test code and returns associated metadata.
 * Supports both real and demo data.
 * 
 * Features:
 * - CORS headers for cross-origin requests
 * - UTF-8 encoding
 * - CSV-based data storage
 * - Fallback to demo data if code not found
 * - Returns JSON with full metadata
 * 
 * Used in the client-side `validateCode` function to authenticate users.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// File paths for databases
$filename = __DIR__ . '/database/database_demo.csv';

/**
 * Reads a CSV file and converts it to an associative array.
 * 
 * @param string $filename Path to the CSV file
 * @return array Array of associative arrays (one per row)
 * 
 * Skips header row. Maps key-value pairs from alternating columns (key, value).
 * Returns empty array if file does not exist or is unreadable.
 */
function readCsv($filename) {
    if (!file_exists($filename)) {
        return [];
    }
    $handle = fopen($filename, "r");
    if (!$handle) {
        return [];
    }

    // Skip header row
    fgetcsv($handle, 0, ",");

    $dataArray = [];
    while (($line = fgetcsv($handle, 0, ",")) !== false) {
        $obj = [
            "key" => $line[0] ?? null,
            "language" => $line[1] ?? null,
            "timestamp" => $line[2] ?? null,
        ];

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

// Get test code from query parameter
$code = $_GET['code'] ?? null;
header('Content-Type: application/json; charset=utf-8');

// Validate input
if ($code === null) {
    http_response_code(400);
    echo json_encode(["error" => "Kein Code angegeben"]);
    exit;
}

// Try to find code in real database
$dataArray = readCsv($filename);
$result = null;
foreach ($dataArray as $item) {
    if (isset($item['markerIdentifier']) && $item['markerIdentifier'] === $code) {
        $result = $item;
        break;
    }
}

// Handle not found
if ($result === null) {
    http_response_code(404);
    echo json_encode(["error" => "Code nicht gefunden"]);
} else {
    // Return full metadata with pretty-print and Unicode support
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>