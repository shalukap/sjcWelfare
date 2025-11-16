<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== USER DATA CHECK ===\n\n";

$users = User::all();

foreach ($users as $user) {
    echo "User ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "is_admin: " . ($user->is_admin ? 'true' : 'false') . "\n";
    echo "Permissions: " . json_encode($user->permissions, JSON_PRETTY_PRINT) . "\n";
    echo "---\n";
}

echo "Total users: " . $users->count() . "\n";