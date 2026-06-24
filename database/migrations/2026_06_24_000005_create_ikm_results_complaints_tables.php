<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ikm_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('period_id')->constrained('survey_periods')->cascadeOnDelete();
            $table->foreignId('opd_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('total_respondents')->default(0);
            $table->decimal('score', 5, 2);
            $table->char('grade', 1);
            $table->timestamp('calculated_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->nullable()->constrained('survey_responses')->nullOnDelete();
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->string('name')->default('Anonymous');
            $table->string('contact')->nullable();
            $table->text('content');
            $table->enum('status', ['pending', 'resolved'])->default('pending');
            $table->text('follow_up_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('ikm_results');
    }
};
