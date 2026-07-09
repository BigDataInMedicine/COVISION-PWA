#!/usr/bin/env php
<?php
date_default_timezone_set('Europe/Berlin');

$productToken = '';
$proxy = '';
$queueDir = '/var/www/html/queue/';

/* =====================================================
   Define SMS message templates
   -----------------------------------------------------
   The first message contains the participant's
   verification code.

   Marker messages are sent later according to the
   schedule stored in the participant's queue file.
===================================================== */

$messages = [
    'en' => [
        'first' => 'Your verification code for the COVISION app is: %s',
        'marker' => 'Please open the COVISION app. A new assessment is now available.'
    ],
    'se' => [
        'first' => 'Din kod för att bekräfta ditt telefonnummer i COVISION-appen: %s',
        'marker' => 'Det är dags för din nästa bedömning. Vänligen öppna COVISION-appen.'
    ]
];

/* =====================================================
   Process all queue files
   -----------------------------------------------------
   Each queue file represents one participant and stores
   the current SMS delivery status together with all
   scheduled marker notifications.
===================================================== */

$files = glob($queueDir . '*');

foreach ($files as $file) {
    if (!is_file($file)) {
        continue;
    }

    // Read the complete queue file into memory.
    $linesRaw = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if ($linesRaw === false) {
        fwrite(STDERR, "[" . date('Y-m-d H:i:s') . "] Unable to read queue file: $file\n");
        continue;
    }

    $lines = array_map(function($line) {
        return str_getcsv(trim($line), ",", '"', "\\");
    }, $linesRaw);

    if (empty($lines)) continue;

    $fileChanged = false;

    // The filename (without extension) represents the participant's phone number.
    $number = basename($file, '.csv');

    /* -----------------------------------------------------
       Step 1:
       Send the initial verification SMS.

       The first row stores the participant information
       including the verification code and two processing
       flags.

       The verification SMS is sent only once while the
       first status flag is still set to false.
    ------------------------------------------------------ */

    $first = $lines[0];
    $lang = $first[0] ?? 'en';

    if (isset($first[3]) && $first[3] === 'false') {
        $code = $first[2];

        $text = sprintf(
            $messages[$lang]['first'] ?? $messages['en']['first'],
            $code
        );

        if (sendSMS($number, $text, $productToken, $proxy)) {
            $lines[0][3] = 'true';
            $fileChanged = true;

            echo "[" . date('Y-m-d H:i:s') . "] Verification SMS sent to $number\n";

        } else {
            fwrite(STDERR, "[" . date('Y-m-d H:i:s') . "] Failed to send verification SMS to $number\n");
        }
    }

    /* -----------------------------------------------------
       Step 2:
       Process scheduled marker notifications.

       Marker reminders are only processed after the
       participant has confirmed the verification code
       (second status flag == true).

       Every scheduled notification whose timestamp is
       due and has not yet been sent will trigger an SMS.
    ------------------------------------------------------ */

    if (isset($first[4]) && $first[4] === 'true') {
        $now = new DateTime();
        $nowStr = $now->format('Y-m-d H:i');

        for ($i = 1; $i < count($lines); $i++) {
            $entry = $lines[$i];

            if (count($entry) < 3) continue;

            $entryTimeStr = trim($entry[1]);
            $smsSent = trim($entry[2]);
            $entryLang = $entry[0] ?? 'en';

            // Support timestamps with and without seconds.
            $entryTime = DateTime::createFromFormat('Y-m-d H:i:s', $entryTimeStr);

            if (!$entryTime) {
                $entryTime = DateTime::createFromFormat('Y-m-d H:i', $entryTimeStr);
            }

            if (!$entryTime) {
                fwrite(STDERR, "[" . date('Y-m-d H:i:s') . "] Invalid timestamp in $file: '$entryTimeStr'\n");

                continue;
            }

            if (
                $entryTime->format('Y-m-d H:i') <= $nowStr &&
                $smsSent === 'false'
            ) {
                $text = $messages[$entryLang]['marker']
                    ?? $messages['en']['marker'];

                if (sendSMS($number, $text, $productToken, $proxy)) {
                    $lines[$i][2] = 'true';
                    $fileChanged = true;

                    echo "[" . date('Y-m-d H:i:s') . "] Marker reminder sent to $number for $entryTimeStr\n";
                } else {
                    fwrite(STDERR, "[" . date('Y-m-d H:i:s') . "] Failed to send marker reminder to $number for $entryTimeStr\n");
                }
            }
        }

        /* -----------------------------------------------------
           Step 3:
           Determine whether the queue has been completed.

           Once every delivery flag in the queue is set to
           true, all required SMS messages have been sent and
           the queue file can safely be removed.
        ------------------------------------------------------ */

        $allTrue = true;

        foreach ($lines as $line) {
            $smsIndex = isset($line[3]) ? 3 : 2;

            if (
                isset($line[$smsIndex]) &&
                $line[$smsIndex] === 'false'
            ) {
                $allTrue = false;
                break;
            }
        }

        if ($allTrue) {
            unlink($file);

            echo "[" . date('Y-m-d H:i:s') . "] Queue deleted: $file (all SMS messages have been sent)\n";

            continue;
        }
    }

    /* -----------------------------------------------------
       Step 4:
       Persist all queue updates.

       Rewrite the queue file only if at least one status
       flag has changed during this execution.
    ------------------------------------------------------ */

    if ($fileChanged) {
        $fp = fopen($file, 'w');

        foreach ($lines as $row) {
            fputcsv($fp, $row, ",", '"', "\\");
        }

        fclose($fp);

        echo "[" . date('Y-m-d H:i:s') . "] Queue updated: $file\n";
    }
}

/* =====================================================
   Send an SMS via the CM.com Messaging API
   -----------------------------------------------------
   Creates the required JSON payload, submits it to the
   messaging gateway and returns whether the message was
   accepted successfully.
===================================================== */

function sendSMS($number, $text, $productToken, $proxy)
{
    // Ensure that the message body is encoded as UTF-8.
    $text = mb_convert_encoding($text, 'UTF-8', 'auto');

    // Build the request payload expected by the CM.com API.
    $payload = [
        "messages" => [
            "msg" => [
                [
                    "from" => "Covision",
                    "to" => [
                        ["number" => $number]
                    ],
                    "body" => [
                        "type" => "auto",
                        "content" => $text
                    ],
                    "reference" => "ref_" . time()
                ]
            ]
        ]
    ];

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);

    $ch = curl_init('https://gw.messaging.cm.com/v1.0/message');

    curl_setopt_array($ch, [
        CURLOPT_PROXY => $proxy,
        CURLOPT_PROXYTYPE => CURLPROXY_HTTP,
        CURLOPT_HTTPPROXYTUNNEL => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $json,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Content-Type: application/json; charset=UTF-8',
            'X-CM-PRODUCTTOKEN: ' . $productToken
        ],
        CURLOPT_TIMEOUT => 10
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($response === false) {

        fwrite(STDERR, "[" . date('Y-m-d H:i:s') . "] Failed to send SMS to $number (HTTP $httpCode)\n");

        return false;
    }

    return true;
}
?>