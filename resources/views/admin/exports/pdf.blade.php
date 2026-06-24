<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Hasil SKM - {{ $scopeName }}</title>
    <style>
        /* Force printing of background colors and styles */
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 30px;
            font-size: 13px;
            line-height: 1.45;
        }

        .no-print-bar {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 14px 24px;
            border-radius: 8px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .btn-print {
            background-color: #1e3a8a;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(30,58,138,0.2);
        }

        .btn-print:hover {
            background-color: #172e6b;
            transform: translateY(-1px);
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        @media print {
            .no-print {
                display: none !important;
            }
            body {
                padding: 10px;
                font-size: 12px;
                background-color: #ffffff !important;
            }
            .metric-card {
                background: #f8fafc !important;
            }
        }
    </style>
</head>
<body>

    <!-- Print control bar (hidden when printing) -->
    <div class="no-print-bar no-print">
        <div>
            <strong style="color: #1e3a8a; font-size: 15px;">Pratinjau Laporan Resmi SKM Permen PANRB 14/2017</strong>
            <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748b;">Gunakan tombol cetak untuk menyimpan sebagai PDF atau mencetak fisik dokumen.</p>
        </div>
        <div>
            <button onclick="window.print();" class="btn-print">Cetak Laporan / Simpan PDF</button>
        </div>
    </div>

    <!-- Kop Surat Resmi Pemerintah Kabupaten Soppeng -->
    <table class="kop-table" style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 10px;">
        <tr>
            <td style="width: 85px; vertical-align: middle; padding: 0; border: none;">
                <!-- Customized SVG crest for Kabupaten Soppeng representation -->
                <svg class="header-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 75px; height: 75px; display: block; margin: 0 auto;">
                    <!-- Outer navy/gold shield -->
                    <path d="M50,5 L90,25 C90,65 50,95 50,95 C50,95 10,65 10,25 Z" fill="#1e3a8a" stroke="#fbbf24" stroke-width="2.5"/>
                    <!-- Inner shield -->
                    <path d="M50,9 L84,27 C84,59 50,87 50,87 C50,87 16,59 16,27 Z" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                    <!-- Gold star at the top center -->
                    <polygon points="50,15 53,24 62,24 55,30 57,39 50,33 43,39 45,30 38,24 47,24" fill="#fbbf24"/>
                    <!-- Rice (Padi) and Cotton representation inside -->
                    <path d="M38,65 Q30,48 38,34" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
                    <path d="M62,65 Q70,48 62,34" fill="none" stroke="#ecfdf5" stroke-width="2.5" stroke-linecap="round"/>
                    <!-- Mini banner inside -->
                    <path d="M22,70 Q50,78 78,70 L78,77 Q50,85 22,77 Z" fill="#fbbf24" stroke="#d97706" stroke-width="0.5"/>
                    <text x="50" y="76" font-size="5" font-family="Segoe UI, sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">SOPPENG</text>
                </svg>
            </td>
            <td style="text-align: center; vertical-align: middle; padding: 0 0 0 10px; border: none; line-height: 1.3;">
                <div style="font-size: 15px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #0f172a;">PEMERINTAH KABUPATEN SOPPENG</div>
                @if($isOpdReport && isset($opdName))
                    <div style="font-size: 18px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; margin-top: 2px;">{{ $opdName }}</div>
                @else
                    <div style="font-size: 18px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; margin-top: 2px;">SEKRETARIAT DAERAH</div>
                @endif
                <div style="font-size: 10px; color: #475569; margin-top: 4px; font-weight: 500;">
                    Jalan Salotungo No. 1, Watansoppeng, Sulawesi Selatan 90812
                </div>
                <div style="font-size: 10px; color: #475569; font-weight: 500;">
                    Telepon (0484) 21002 | Website: <span style="color: #1e3a8a;">soppengkab.go.id</span> | Email: info@soppengkab.go.id
                </div>
            </td>
        </tr>
    </table>
    <!-- Double border line under Kop Surat -->
    <div style="border-top: 3px solid #0f172a; border-bottom: 1px solid #0f172a; height: 1px; margin-bottom: 22px;"></div>

    <!-- Header Dokumen Laporan -->
    <div class="text-center" style="margin-bottom: 25px;">
        <h2 style="font-size: 15px; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a; letter-spacing: 0.3px;">LAPORAN HASIL SURVEI KEPUASAN MASYARAKAT (SKM)</h2>
        <div style="font-size: 13px; font-weight: 700; color: #475569; margin-top: 5px; text-transform: uppercase;">
            LAYANAN: <span style="color: #1e3a8a;">{{ $scopeName }}</span>
        </div>
        <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 5px;">
            PERIODE: {{ $period->name }} ({{ \Carbon\Carbon::parse($period->start_date)->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($period->end_date)->translatedFormat('d F Y') }})
        </div>
    </div>

    <!-- Premium Metrics Dashboard Card Grid -->
    <div class="metrics-container" style="display: table; width: 100%; table-layout: fixed; margin-bottom: 25px; border-spacing: 12px 0;">
        
        <!-- Card 1: IKM Score -->
        <div class="metric-card" style="display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; vertical-align: top; text-align: center;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.5px;">Indeks IKM</div>
            <div style="font-size: 34px; font-weight: 900; color: #1e3a8a; line-height: 1;">{{ number_format($stats['score'], 2) }}</div>
            
            @php
                $badgeBg = '#eff6ff'; $badgeText = '#1e40af'; $badgeBorder = '#bfdbfe';
                if ($stats['grade'] === 'A') {
                    $badgeBg = '#ecfdf5'; $badgeText = '#065f46'; $badgeBorder = '#a7f3d0';
                } elseif ($stats['grade'] === 'B') {
                    $badgeBg = '#f0fdf4'; $badgeText = '#166534'; $badgeBorder = '#bbf7d0';
                } elseif ($stats['grade'] === 'C') {
                    $badgeBg = '#fffbeb'; $badgeText = '#92400e'; $badgeBorder = '#fde68a';
                } elseif ($stats['grade'] === 'D') {
                    $badgeBg = '#fef2f2'; $badgeText = '#991b1b'; $badgeBorder = '#fecaca';
                }
            @endphp
            
            <div style="display: inline-block; font-size: 10px; font-weight: 800; background: {{ $badgeBg }}; color: {{ $badgeText }}; border: 1px solid {{ $badgeBorder }}; padding: 3px 8px; border-radius: 4px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.3px;">
                MUTU: {{ $stats['grade_label'] }} ({{ $stats['grade'] }})
            </div>
            <!-- Tiny visual fill bar -->
            <div style="height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 10px; overflow: hidden;">
                <div style="height: 100%; background: {{ $badgeText }}; width: {{ $stats['score'] }}%;"></div>
            </div>
        </div>
        
        <!-- Card 2: Responden Partisipasi -->
        <div class="metric-card" style="display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; vertical-align: top;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px; text-align: center; letter-spacing: 0.5px;">Partisipasi</div>
            <div style="font-size: 34px; font-weight: 900; color: #0f172a; line-height: 1; text-align: center;">{{ number_format($stats['total_respondents']) }}</div>
            <div style="font-size: 10px; color: #475569; text-align: center; margin-top: 10px; font-weight: 500; line-height: 1.4;">
                Total Responden terverifikasi yang memberikan penilaian pada periode aktif.
            </div>
        </div>
        
        <!-- Card 3: Unsur Tertinggi & Terendah -->
        <div class="metric-card" style="display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; vertical-align: top;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; text-align: center; letter-spacing: 0.5px;">Kinerja Unsur</div>
            
            <div style="font-size: 11px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; color: #065f46; background: #ecfdf5; padding: 1px 5px; border-radius: 3px; font-size: 9px;">TERTINGGI:</span>
                <span style="font-weight: 800; color: #065f46; font-size: 11px;">
                    @if($stats['highest_indicator'])
                        {{ $stats['highest_indicator']['code'] }} ({{ number_format($stats['highest_indicator']['score'], 2) }})
                    @else
                        -
                    @endif
                </span>
            </div>
            @if($stats['highest_indicator'])
                <div style="font-size: 9px; color: #475569; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;" title="{{ $stats['highest_indicator']['name'] }}">
                    {{ $stats['highest_indicator']['name'] }}
                </div>
            @endif
            
            <div style="font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; color: #991b1b; background: #fef2f2; padding: 1px 5px; border-radius: 3px; font-size: 9px;">TERENDAH:</span>
                <span style="font-weight: 800; color: #991b1b; font-size: 11px;">
                    @if($stats['lowest_indicator'])
                        {{ $stats['lowest_indicator']['code'] }} ({{ number_format($stats['lowest_indicator']['score'], 2) }})
                    @else
                        -
                    @endif
                </span>
            </div>
            @if($stats['lowest_indicator'])
                <div style="font-size: 9px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;" title="{{ $stats['lowest_indicator']['name'] }}">
                    {{ $stats['lowest_indicator']['name'] }}
                </div>
            @endif
        </div>
    </div>

    <!-- Tabel NRR Per Unsur -->
    <div style="font-size: 11.5px; font-weight: 800; color: #1e3a8a; border-left: 3.5px solid #1e3a8a; padding-left: 8px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.3px;">
        Indeks Kepuasan Per Unsur Pelayanan (Permen PANRB 14/2017)
    </div>
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <thead>
            <tr style="background: #1e3a8a; color: #ffffff;">
                <th style="padding: 10px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; border: 1px solid #1e3a8a; text-align: center; width: 8%;">Kode</th>
                <th style="padding: 10px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; border: 1px solid #1e3a8a; text-align: left; width: 44%;">Unsur Pelayanan</th>
                <th style="padding: 10px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; border: 1px solid #1e3a8a; text-align: center; width: 14%;">Nilai NRR</th>
                <th style="padding: 10px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; border: 1px solid #1e3a8a; text-align: center; width: 20%;">Visualisasi Skor</th>
                <th style="padding: 10px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; border: 1px solid #1e3a8a; text-align: center; width: 14%;">Konversi (100)</th>
            </tr>
        </thead>
        <tbody>
            @if(count($stats['indicators']) > 0)
                @foreach($stats['indicators'] as $ind)
                    @php
                        $isLowest = $stats['lowest_indicator'] && $stats['lowest_indicator']['code'] === $ind['code'];
                        $rowBg = $isLowest ? '#fef2f2' : '';
                        $scorePct = ($ind['nrr'] / 4.0) * 100;
                        $barColor = '#3b82f6';
                        if ($ind['nrr'] >= 3.53) {
                            $barColor = '#10b981'; // Sangat Baik (Hijau)
                        } elseif ($ind['nrr'] >= 3.06) {
                            $barColor = '#10b981'; // Baik (Hijau)
                        } elseif ($ind['nrr'] >= 2.6) {
                            $barColor = '#f59e0b'; // Kurang Baik (Kuning)
                        } else {
                            $barColor = '#ef4444'; // Tidak Baik (Merah)
                        }
                        $konversi = $ind['nrr'] * 25;
                    @endphp
                    <tr style="background: {{ $rowBg }};">
                        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0f172a;">{{ $ind['code'] }}</td>
                        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #334155;">
                            {{ $ind['name'] }}
                            @if($isLowest)
                                <span style="font-size: 9px; background: #ef4444; color: #ffffff; padding: 1px 5px; border-radius: 3px; font-weight: 700; margin-left: 6px; text-transform: uppercase; letter-spacing: 0.3px;">Perlu Perbaikan</span>
                            @endif
                        </td>
                        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0f172a;">{{ number_format($ind['nrr'], 3) }}</td>
                        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle;">
                            <div style="height: 8px; background: #e2e8f0; border-radius: 4px; width: 100%; overflow: hidden; display: inline-block; vertical-align: middle;">
                                <div style="height: 100%; background: {{ $barColor }}; width: {{ $scorePct }}%;"></div>
                            </div>
                        </td>
                        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #1e3a8a;">{{ number_format($konversi, 2) }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="5" style="padding: 15px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">Tidak ada data unsur yang tercatat.</td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- Profil Demografi Responden -->
    <div style="font-size: 11.5px; font-weight: 800; color: #1e3a8a; border-left: 3.5px solid #1e3a8a; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.3px; page-break-before: auto;">
        Profil Demografi Responden
    </div>
    <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 20px;">
        <tr>
            <!-- Jenis Kelamin -->
            <td style="width: 32%; padding: 0; vertical-align: top; border: none;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; min-height: 150px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; text-align: center; letter-spacing: 0.3px;">Jenis Kelamin</div>
                    @php
                        $totalGender = array_sum($demographics['gender']);
                        $countL = $demographics['gender']['L'] ?? 0;
                        $countP = $demographics['gender']['P'] ?? 0;
                        $pctL = $totalGender > 0 ? ($countL / $totalGender) * 100 : 0;
                        $pctP = $totalGender > 0 ? ($countP / $totalGender) * 100 : 0;
                    @endphp
                    
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                            <span style="font-weight: 600; color: #475569;">Laki-laki</span>
                            <span style="font-weight: 700; color: #0f172a;">{{ number_format($countL) }} ({{ round($pctL, 1) }}%)</span>
                        </div>
                        <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; background: #3b82f6; width: {{ $pctL }}%;"></div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                            <span style="font-weight: 600; color: #475569;">Perempuan</span>
                            <span style="font-weight: 700; color: #0f172a;">{{ number_format($countP) }} ({{ round($pctP, 1) }}%)</span>
                        </div>
                        <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; background: #ec4899; width: {{ $pctP }}%;"></div>
                        </div>
                    </div>
                </div>
            </td>
            
            <td style="width: 2%; border: none;"></td> <!-- Spacer -->
            
            <!-- Pendidikan -->
            <td style="width: 32%; padding: 0; vertical-align: top; border: none;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; min-height: 150px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; text-align: center; letter-spacing: 0.3px;">Pendidikan</div>
                    @php
                        $totalEdu = array_sum($demographics['education']);
                        $eduList = ['SD', 'SMP', 'SMA', 'Diploma', 'S1', 'S2/S3'];
                    @endphp
                    @foreach($eduList as $edu)
                        @php
                            $countE = $demographics['education'][$edu] ?? 0;
                            $pctE = $totalEdu > 0 ? ($countE / $totalEdu) * 100 : 0;
                        @endphp
                        <div style="margin-bottom: 5px;">
                            <div style="display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 1px;">
                                <span style="font-weight: 600; color: #475569;">{{ $edu }}</span>
                                <span style="font-weight: 700; color: #0f172a;">{{ number_format($countE) }} ({{ round($pctE, 0) }}%)</span>
                            </div>
                            <div style="height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                                <div style="height: 100%; background: #6366f1; width: {{ $pctE }}%;"></div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </td>
            
            <td style="width: 2%; border: none;"></td> <!-- Spacer -->
            
            <!-- Pekerjaan -->
            <td style="width: 32%; padding: 0; vertical-align: top; border: none;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; min-height: 150px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; text-align: center; letter-spacing: 0.3px;">Pekerjaan</div>
                    @php
                        $totalJob = array_sum($demographics['job']);
                        $jobList = ['PNS/TNI/Polri', 'Pegawai Swasta', 'Wiraswasta/Usahawan', 'Pelajar/Mahasiswa', 'Buruh/Tani', 'Lainnya'];
                    @endphp
                    @foreach($jobList as $job)
                        @php
                            $countJ = $demographics['job'][$job] ?? 0;
                            $pctJ = $totalJob > 0 ? ($countJ / $totalJob) * 100 : 0;
                            $shortJob = $job === 'Wiraswasta/Usahawan' ? 'Wiraswasta' : ($job === 'Pelajar/Mahasiswa' ? 'Pelajar/Mhs' : $job);
                        @endphp
                        <div style="margin-bottom: 5px;">
                            <div style="display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 1px;">
                                <span style="font-weight: 600; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65px;">{{ $shortJob }}</span>
                                <span style="font-weight: 700; color: #0f172a;">{{ number_format($countJ) }} ({{ round($pctJ, 0) }}%)</span>
                            </div>
                            <div style="height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                                <div style="height: 100%; background: #14b8a6; width: {{ $pctJ }}%;"></div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </td>
        </tr>
    </table>

    <!-- Age Groups Row -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 15px; margin-bottom: 25px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-row;">
            <div style="display: table-cell; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; vertical-align: middle; width: 15%; letter-spacing: 0.3px;">Kelompok Usia:</div>
            @php
                $totalAge = array_sum($demographics['age_groups']);
            @endphp
            @foreach($demographics['age_groups'] as $group => $countA)
                @php
                    $pctA = $totalAge > 0 ? ($countA / $totalAge) * 100 : 0;
                @endphp
                <div style="display: table-cell; padding: 0 10px; vertical-align: middle; text-align: center; border-left: 1px solid #e2e8f0;">
                    <div style="font-size: 9px; color: #64748b; font-weight: 600;">{{ $group }}</div>
                    <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                        {{ number_format($countA) }} <span style="font-size: 8.5px; font-weight: 500; color: #64748b;">({{ round($pctA, 0) }}%)</span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Rencana Tindak Lanjut (RTL) -->
    @if(count($recommendations) > 0)
        <div style="font-size: 11.5px; font-weight: 800; color: #1e3a8a; border-left: 3.5px solid #1e3a8a; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.3px; page-break-before: auto;">
            Rencana Tindak Lanjut Perbaikan Layanan Publik
        </div>
        <div style="margin-bottom: 25px;">
            @foreach($recommendations as $rec)
                <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; overflow: hidden; page-break-inside: avoid; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <div style="background: #f1f5f9; padding: 6px 12px; font-size: 9.5px; font-weight: 800; color: #334155; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
                        <span style="letter-spacing: 0.3px;">UNIT LAYANAN: {{ $rec->unit->name }}</span>
                        <span style="color: #64748b;">Rekomendasi ID #{{ $rec->id }}</span>
                    </div>
                    <div style="padding: 10px 12px;">
                        <div style="font-size: 11.5px; font-weight: 600; color: #0f172a; margin-bottom: 8px; line-height: 1.4;">
                            &ldquo;{{ $rec->content }}&rdquo;
                        </div>
                        
                        @if(count($rec->follow_ups) > 0)
                            <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 8px;">
                                <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.3px;">Langkah Aksi & Realisasi Tindak Lanjut:</div>
                                @foreach($rec->follow_ups as $fu)
                                    @php
                                        $statusText = 'Menunggu'; $statusBg = '#f1f5f9'; $statusColor = '#475569';
                                        if ($fu->status === 'completed') {
                                            $statusText = 'Selesai'; $statusBg = '#dcfce7'; $statusColor = '#15803d';
                                        } elseif ($fu->status === 'in_progress') {
                                            $statusText = 'Dalam Proses'; $statusBg = '#dbeafe'; $statusColor = '#1d4ed8';
                                        }
                                    @endphp
                                    <div style="display: flex; justify-content: space-between; font-size: 10.5px; background: #fafafa; border: 1px solid #f1f5f9; border-radius: 4px; padding: 6px 10px; margin-bottom: 4px; align-items: center;">
                                        <div style="flex: 1; padding-right: 10px; color: #334155; font-weight: 500;">
                                            <span style="font-weight: 700; color: #1e3a8a;">Aksi:</span> {{ $fu->action_plan }}
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                                            <span style="font-size: 8px; font-weight: 800; background: {{ $statusBg }}; color: {{ $statusColor }}; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.3px;">
                                                {{ $statusText }}
                                            </span>
                                            <span style="font-weight: 800; color: #1e3a8a; font-size: 11px;">
                                                {{ $fu->progress_percentage }}%
                                            </span>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    <!-- Tanda Tangan / Lembar Pengesahan -->
    <div style="margin-top: 40px; display: table; width: 100%; page-break-inside: avoid;">
        <div style="display: table-row;">
            <div style="display: table-cell; width: 50%; text-align: center; vertical-align: top;">
                <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: 0.3px;">Mengetahui,</p>
                <p style="margin: 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px;">Kepala Organisasi Perangkat Daerah</p>
                <div style="height: 60px;"></div>
                <p style="border-bottom: 1.5px solid #0f172a; display: inline-block; min-width: 180px; margin: 0 0 3px 0; font-weight: 800; color: #0f172a;"></p>
                <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 500;">NIP. .................................................</p>
            </div>
            <div style="display: table-cell; width: 50%; text-align: center; vertical-align: top;">
                <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: 0.3px;">Watansoppeng, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
                <p style="margin: 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px;">Petugas Pengelola SKM Daerah</p>
                <div style="height: 60px;"></div>
                <p style="border-bottom: 1.5px solid #1e3a8a; display: inline-block; min-width: 180px; margin: 0 0 3px 0; font-weight: 800; color: #1e3a8a; font-size: 12px;">{{ $officerName }}</p>
                <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600;">{{ $opdName }}</p>
            </div>
        </div>
    </div>

    <!-- Catatan Kaki Resmi / Peraturan -->
    <div style="font-size: 10px; color: #64748b; margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; line-height: 1.5; font-weight: 500;">
        Laporan SKM Nasional generated by SATUKAN - Sistem Terpadu Kepuasan Masyarakat Kabupaten Soppeng.
        <br>
        <span style="font-style: italic;">Sesuai dengan ketentuan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 14 Tahun 2017.</span>
    </div>

    <script>
        // Automatic print trigger setup
        window.addEventListener('DOMContentLoaded', () => {
            if (window.location.search.includes('autoprint=1')) {
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        });
    </script>
</body>
</html>
