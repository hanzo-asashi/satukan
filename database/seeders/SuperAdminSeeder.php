<?php

namespace Database\Seeders;

use App\Models\Opd;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get Roles
        $superadminRole = Role::where('slug', 'superadmin')->first();
        $opdadminRole = Role::where('slug', 'admin_opd')->first();

        // 2. Create/Update Superadmin User
        $superadmin = User::updateOrCreate(
            ['email' => 'admin@satukan.test'],
            [
                'name' => 'Super Admin Satukan',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if ($superadminRole && ! $superadmin->roles()->where('slug', 'superadmin')->exists()) {
            $superadmin->roles()->attach($superadminRole->id);
        }

        // 3. Create/Update OPD Admin User for testing (linked to DISDUKCAPIL)
        $disdukcapil = Opd::where('code', 'DISDUKCAPIL')->first();
        if ($disdukcapil) {
            $opdadmin = User::updateOrCreate(
                ['email' => 'opd.admin@satukan.test'],
                [
                    'name' => 'Admin OPD Disdukcapil',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'opd_id' => $disdukcapil->id,
                ]
            );

            if ($opdadminRole && ! $opdadmin->roles()->where('slug', 'admin_opd')->exists()) {
                $opdadmin->roles()->attach($opdadminRole->id);
            }
        }
    }
}
