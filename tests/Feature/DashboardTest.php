<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard and receive rtlStats', function () {
    $this->seed(RoleSeeder::class);

    $user = User::factory()->create();
    $user->roles()->attach(Role::where('slug', 'superadmin')->first());
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('rtlStats')
        ->has('rtlStats.total')
        ->has('rtlStats.completed')
        ->has('rtlStats.in_progress')
        ->has('rtlStats.not_started')
        ->has('rtlStats.completion_rate')
    );
});
