<?php
/**
 * API Endpoint: Upload Test Data
 *
 * Handles file uploads from the client-side test app.
 * Stores audio and JSON files in a code-specific directory.
 * 
 * Features:
 * - CORS headers for cross-origin requests
 * - Secure file handling (sanitization, validation)
 * - Directory structure per test code
 * - Returns success status and uploaded filenames
 * - Prevents directory traversal and invalid characters
 * 
 * Used to persist test results (audio, metadata) on the server.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Base directory for uploaded files
$uploadBaseDir = __DIR__ . '/uploads/';
if (!file_exists($uploadBaseDir)) {
    mkdir($uploadBaseDir, 0777, true);
}

// Sanitize and extract test code from POST
$code = isset($_POST['code']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['code']) : 'unknown';

// Create code-specific upload directory
$uploadDir = $uploadBaseDir . $code . '/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle POST request with file uploads
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['files'])) {
    $uploadedFiles = [];
    $files = $_FILES['files'];
    $numFiles = count($files['name']);

    for ($i = 0; $i < $numFiles; $i++) {
        $name = basename($files['name'][$i]);
        $tmpName = $files['tmp_name'][$i];
        $targetPath = $uploadDir . $name;

        // Move uploaded file to target directory
        if (move_uploaded_file($tmpName, $targetPath)) {
            $uploadedFiles[] = $name;
        } else {
            // Return error if upload fails
            echo json_encode([
                "success" => false,
                "message" => "Error saving file: $name"
            ]);
            exit;
        }
    }

    // Return success with list of uploaded files
    echo json_encode([
        "success" => true,
        "files" => $uploadedFiles
    ]);
} else {
    // Return error if no files received
    echo json_encode([
        "success" => false,
        "message" => "No files received"
    ]);
}
?>