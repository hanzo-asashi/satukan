<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'Manage Settings',
                'slug' => 'manage-settings',
                'description' => 'Manage national integration and regional settings',
            ],
            [
                'name' => 'Manage Users',
                'slug' => 'manage-users',
                'description' => 'Manage system users and role assignments',
            ],
            [
                'name' => 'Manage OPDs',
                'slug' => 'manage-opds',
                'description' => 'Manage regional OPD organizations',
            ],
            [
                'name' => 'Manage Units',
                'slug' => 'manage-units',
                'description' => 'Manage service units within OPDs',
            ],
            [
                'name' => 'Manage Surveys',
                'slug' => 'manage-surveys',
                'description' => 'Create, publish and manage surveys',
            ],
            [
                'name' => 'View Analytics',
                'slug' => 'view-analytics',
                'description' => 'View IKM real-time scores and statistics',
            ],
            [
                'name' => 'Manage Complaints',
                'slug' => 'manage-complaints',
                'description' => 'Manage public complaints and follow ups',
            ],
            [
                'name' => 'Manage Recommendations',
                'slug' => 'manage-recommendations',
                'description' => 'Manage recommendations and action plans',
            ],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(['slug' => $perm['slug']], $perm);
        }

        // Sync with Roles
        $superadmin = Role::where('slug', 'superadmin')->first();
        if ($superadmin) {
            $superadmin->permissions()->sync(Permission::all());
        }

        $opdAdmin = Role::where('slug', 'admin_opd')->first();
        if ($opdAdmin) {
            $opdAdminPermissions = Permission::whereIn('slug', [
                'manage-units',
                'manage-surveys',
                'view-analytics',
                'manage-complaints',
                'manage-recommendations',
            ])->get();
            $opdAdmin->permissions()->sync($opdAdminPermissions);
        }
    }
}
