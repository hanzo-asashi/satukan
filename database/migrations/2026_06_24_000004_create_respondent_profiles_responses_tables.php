<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('respondent_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 16)->nullable()->index();
            $table->string('name')->default('Anonymous');
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->unsignedInteger('age')->nullable();
            $table->string('education', 100)->nullable();
            $table->string('job', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        Schema::create('survey_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained()->cascadeOnDelete();
            $table->foreignId('respondent_profile_id')->constrained()->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('survey_response_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->constrained('survey_responses')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('survey_questions')->cascadeOnDelete();
            $table->unsignedTinyInteger('score'); // 1 to 4
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_response_details');
        Schema::dropIfExists('survey_responses');
        Schema::dropIfExists('respondent_profiles');
    }
};
