<?php
/**
 * Quick script to set up admin user
 * Run: php setup-admin.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

echo "=== Setting up admin user ===\n\n";

// Find shaluka user
$user = User::where('email', 'shaluka@gmail.com')->first();

if (!$user) {
    echo "ERROR: User with email 'shaluka@gmail.com' not found!\n";
    echo "Available users:\n";
    foreach (User::all(['id', 'name', 'email']) as $u) {
        echo "  - ID: {$u->id}, Name: {$u->name}, Email: {$u->email}\n";
    }
    exit(1);
}

echo "Found user: {$user->name} ({$user->email})\n";
echo "Current is_admin: " . ($user->is_admin ? 'true' : 'false') . "\n";
echo "Current permissions: " . json_encode($user->permissions) . "\n\n";

// Set admin flag
$user->is_admin = true;

// Set full permissions
$user->permissions = [
    'Students' => ['View' => true, 'Add' => true, 'Edit' => true, 'Delete' => true],
    'Payments' => ['View' => true, 'Add' => true, 'Edit' => true, 'Delete' => true],
    'Fee Assignment' => ['View' => true, 'Add' => true, 'Edit' => true, 'Delete' => true],
    'Upgrading' => ['View' => true, 'Add' => true, 'Edit' => true, 'Delete' => true],
    'Users' => ['View' => true, 'Add' => true, 'Edit' => true, 'Delete' => true],
];

$user->save();

echo "✓ Updated user:\n";
echo "  is_admin: " . ($user->is_admin ? 'true' : 'false') . "\n";
echo "  permissions: " . json_encode($user->permissions, JSON_PRETTY_PRINT) . "\n\n";

echo "=== Setup complete! ===\n";
echo "Please log out and log back in for changes to take effect.\n";

