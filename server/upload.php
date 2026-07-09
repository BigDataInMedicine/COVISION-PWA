<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

/* =====================================================
   Prepare upload directory
   -----------------------------------------------------
   All uploaded files are stored inside the "uploads"
   directory. Create the directory if it does not yet
   exist.
===================================================== */

$uploadBaseDir = __DIR__ . '/uploads/';

if (!file_exists($uploadBaseDir)) {
    mkdir($uploadBaseDir, 0777, true);
}

/* =====================================================
   Determine participant upload folder
   -----------------------------------------------------
   Expected POST parameter:
   - code : Unique participant identifier

   Each participant receives an individual upload
   directory to keep uploaded files separated.
===================================================== */

$code = isset($_POST['code'])
    ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['code'])
    : 'unknown';

$uploadDir = $uploadBaseDir . $code . '/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

/* =====================================================
   Process uploaded files
   -----------------------------------------------------
   Validate every uploaded file and move it from the
   temporary upload location into the participant's
   upload directory.
===================================================== */

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['files'])) {
    $uploadedFiles = [];
    $files = $_FILES['files'];
    $numFiles = count($files['name']);

    for ($i = 0; $i < $numFiles; $i++) {
        // Use only the filename to prevent directory traversal.
        $name = basename($files['name'][$i]);
        $tmpName = $files['tmp_name'][$i];
        $targetPath = $uploadDir . $name;

        // Verify that PHP completed the upload successfully.
        $error = $_FILES['files']['error'][$i];

        if ($error !== UPLOAD_ERR_OK) {
            echo json_encode([
                "success" => false,
                "message" => "$name: Upload failed with error code $error."
            ]);

            exit;
        }

        // Move the uploaded file into its final destination.
        if (move_uploaded_file($tmpName, $targetPath)) {
            $uploadedFiles[] = $name;
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Failed to save the uploaded file: $name."
            ]);

            exit;
        }
    }

    /* =====================================================
       Success response
    ===================================================== */

    echo json_encode([
        "success" => true,
        "files" => $uploadedFiles
    ]);

} else {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "No files were received."
    ]);
}
?>