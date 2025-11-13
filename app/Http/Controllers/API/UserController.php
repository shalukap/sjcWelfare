<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class UserController extends Controller
{
    public function __construct()
    {

    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       return response()->json(User::all(), 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:users,name',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|confirmed|min:6',
            'permissions' => 'nullable|array',
        ]);

        $attributes = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        // Only include permissions if the column exists (prevents SQL errors before migration runs)
        if (Schema::hasColumn('users', 'permissions') && array_key_exists('permissions', $data)) {
            $attributes['permissions'] = $data['permissions'] ?? [];
        }

        // Include is_admin flag if provided and column exists
        if (Schema::hasColumn('users', 'is_admin') && array_key_exists('is_admin', $data)) {
            $attributes['is_admin'] = (bool) $data['is_admin'];
        }

        $user = User::create($attributes);

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:users,name,' . $user->id,
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|confirmed|min:6',
            'permissions' => 'nullable|array',
        ]);

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }
        if (isset($data['email'])) {
            $user->email = $data['email'];
        }
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        if (Schema::hasColumn('users', 'permissions') && array_key_exists('permissions', $data)) {
            $user->permissions = $data['permissions'] ?? [];
        }

        $user->save();

        return response()->json($user, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted'], 200);
    }
}
