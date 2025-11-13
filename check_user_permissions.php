<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== USER PERMISSIONS CHECK ===\n\n";

$users = User::all();

foreach ($users as $user) {
    echo "User ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "is_admin: " . ($user->is_admin ? 'true' : 'false') . "\n";

    $permissions = $user->permissions ?? [];
    echo "Permissions: " . json_encode($permissions, JSON_PRETTY_PRINT) . "\n";

    // Check if permissions have the expected structure
    if (!empty($permissions)) {
        echo "Permission modules: " . implode(', ', array_keys($permissions)) . "\n";

        // Check for Students module specifically
        if (isset($permissions['Students'])) {
            echo "Students permissions: " . json_encode($permissions['Students']) . "\n";
        }
    }

    echo "---\n";
}

echo "Total users: " . $users->count() . "\n";
