<?php

namespace App\Console\Commands;

use App\Services\NationalSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('national:sync')]
#[Description('Synchronize aggregate IKM data to the national portal')]
class SyncNationalData extends Command
{
    /**
     * Create a new command instance.
     */
    public function __construct(
        protected NationalSyncService $syncService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Memulai sinkronisasi data IKM ke portal nasional...');

        $result = $this->syncService->sync();

        if ($result['success']) {
            $this->info('Sukses: '.$result['message']);

            return Command::SUCCESS;
        }

        $this->error('Gagal: '.$result['message']);

        return Command::FAILURE;
    }
}
