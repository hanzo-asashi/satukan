<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Administrator',
                'slug' => 'superadmin',
                'description' => 'Superadmin has global access to all settings, OPDs, units, logs and integration settings.',
            ],
            [
                'name' => 'OPD Administrator',
                'slug' => 'admin_opd',
                'description' => 'OPD admin manages their specific OPD, units, survey periods, recommendations and follow ups.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
