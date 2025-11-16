<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

// Get the admin user
$admin = User::find(1);

if ($admin) {
    echo "Updating admin user: {$admin->name} ({$admin->email})\n";
    
    // Set proper admin permissions
    $adminPermissions = [
        'Students' => ['View' => true, 'Create' => true, 'Edit' => true, 'Delete' => true],
        'Fee Assignment' => ['View' => true, 'Create' => true, 'Edit' => true, 'Delete' => true],
        'Payments' => ['View' => true, 'Create' => true, 'Edit' => true, 'Delete' => true],
        'Users' => ['View' => true, 'Create' => true, 'Edit' => true, 'Delete' => true],
        'Upgrading' => ['View' => true, 'Create' => true, 'Edit' => true, 'Delete' => true]
    ];
    
    $admin->permissions = $adminPermissions;
    $admin->is_admin = true;
    $admin->save();
    
    echo "Admin permissions updated successfully!\n";
    echo "New permissions: " . json_encode($admin->permissions, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Admin user not found!\n";
}

// Also check the other user
$kesara = User::find(3);
if ($kesara) {
    echo "\nUser kesara permissions: " . json_encode($kesara->permissions, JSON_PRETTY_PRINT) . "\n";
}