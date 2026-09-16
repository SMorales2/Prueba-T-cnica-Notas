<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario Administrador
        User::create([
            'name' => 'Admin Fixlat',
            'email' => 'admin@fixlat.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Usuario Normal
        User::create([
            'name' => 'Usuario Prueba',
            'email' => 'user@fixlat.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'is_active' => true,
        ]);
    }
}