-- SATUKAN Database Schema
-- Compatible with MySQL 8.0+

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `qr_codes`;
DROP TABLE IF EXISTS `api_tokens`;
DROP TABLE IF EXISTS `national_sync_logs`;
DROP TABLE IF EXISTS `follow_ups`;
DROP TABLE IF EXISTS `recommendations`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `ikm_results`;
DROP TABLE IF EXISTS `survey_response_details`;
DROP TABLE IF EXISTS `survey_responses`;
DROP TABLE IF EXISTS `respondent_profiles`;
DROP TABLE IF EXISTS `survey_questions`;
DROP TABLE IF EXISTS `surveys`;
DROP TABLE IF EXISTS `survey_periods`;
DROP TABLE IF EXISTS `units`;
DROP TABLE IF EXISTS `opds`;
DROP TABLE IF EXISTS `permission_role`;
DROP TABLE IF EXISTS `role_user`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Roles Table
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Permissions Table
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Role User Pivot Table
CREATE TABLE `role_user` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_role_user_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Permission Role Pivot Table
CREATE TABLE `permission_role` (
  `permission_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`permission_id`, `role_id`),
  CONSTRAINT `fk_permission_role_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_permission_role_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. OPDs (Organisasi Perangkat Daerah) Table
CREATE TABLE `opds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `logo_url` varchar(2048) DEFAULT NULL,
  `address` text,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opds_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User OPD Mapping
ALTER TABLE `users` ADD COLUMN `opd_id` bigint unsigned NULL DEFAULT NULL AFTER `remember_token`;
ALTER TABLE `users` ADD CONSTRAINT `fk_users_opd` FOREIGN KEY (`opd_id`) REFERENCES `opds` (`id`) ON DELETE SET NULL;

-- 7. Units (Unit Layanan) Table
CREATE TABLE `units` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `opd_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `units_code_unique` (`code`),
  KEY `units_opd_id_index` (`opd_id`),
  CONSTRAINT `fk_units_opd` FOREIGN KEY (`opd_id`) REFERENCES `opds` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Survey Periods Table
CREATE TABLE `survey_periods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL, -- e.g., "Triwulan I - 2026", "Semester II - 2026"
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` boolean NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Surveys Table
CREATE TABLE `surveys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `period_id` bigint unsigned NOT NULL,
  `unit_id` bigint unsigned NOT NULL,
  `is_published` boolean NOT NULL DEFAULT 0,
  `token` varchar(64) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `surveys_token_unique` (`token`),
  KEY `surveys_period_id_index` (`period_id`),
  KEY `surveys_unit_id_index` (`unit_id`),
  CONSTRAINT `fk_surveys_period` FOREIGN KEY (`period_id`) REFERENCES `survey_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_surveys_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Survey Questions Table
CREATE TABLE `survey_questions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` bigint unsigned NOT NULL,
  `indicator_code` varchar(50) NOT NULL, -- U1 to U9 (from Permen PANRB 14/2017)
  `indicator_name` varchar(255) NOT NULL, -- Persyaratan, Prosedur, dll.
  `question_text` text NOT NULL,
  `scale_1_label` varchar(255) NOT NULL DEFAULT 'Tidak Baik',
  `scale_2_label` varchar(255) NOT NULL DEFAULT 'Kurang Baik',
  `scale_3_label` varchar(255) NOT NULL DEFAULT 'Baik',
  `scale_4_label` varchar(255) NOT NULL DEFAULT 'Sangat Baik',
  `is_mandatory` boolean NOT NULL DEFAULT 1,
  `order_index` int unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `survey_questions_survey_id_index` (`survey_id`),
  CONSTRAINT `fk_survey_questions_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Respondent Profiles Table
CREATE TABLE `respondent_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nik` varchar(16) DEFAULT NULL, -- NIK optional validation
  `name` varchar(255) DEFAULT 'Anonymous',
  `gender` enum('L', 'P') DEFAULT NULL, -- Laki-laki / Perempuan
  `age` int unsigned DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL, -- SD, SMP, SMA, Diploma, S1, S2, S3
  `job` varchar(100) DEFAULT NULL, -- PNS, Swasta, TNI/Polri, Wirausaha, dll.
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `respondent_profiles_nik_index` (`nik`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Survey Responses Table
CREATE TABLE `survey_responses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` bigint unsigned NOT NULL,
  `respondent_profile_id` bigint unsigned NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `survey_responses_survey_id_index` (`survey_id`),
  KEY `survey_responses_respondent_profile_id_index` (`respondent_profile_id`),
  CONSTRAINT `fk_survey_responses_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_survey_responses_respondent` FOREIGN KEY (`respondent_profile_id`) REFERENCES `respondent_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Survey Response Details Table
CREATE TABLE `survey_response_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `response_id` bigint unsigned NOT NULL,
  `question_id` bigint unsigned NOT NULL,
  `score` tinyint unsigned NOT NULL, -- 1 to 4
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `survey_response_details_response_id_index` (`response_id`),
  KEY `survey_response_details_question_id_index` (`question_id`),
  CONSTRAINT `fk_response_details_response` FOREIGN KEY (`response_id`) REFERENCES `survey_responses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_response_details_question` FOREIGN KEY (`question_id`) REFERENCES `survey_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. IKM Results Table
CREATE TABLE `ikm_results` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `period_id` bigint unsigned NOT NULL,
  `opd_id` bigint unsigned NULL,
  `unit_id` bigint unsigned NULL,
  `total_respondents` int unsigned NOT NULL DEFAULT 0,
  `score` decimal(5,2) NOT NULL, -- scale 25 - 100
  `grade` char(1) NOT NULL, -- A, B, C, D
  `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ikm_results_period_index` (`period_id`),
  KEY `ikm_results_opd_index` (`opd_id`),
  KEY `ikm_results_unit_index` (`unit_id`),
  CONSTRAINT `fk_ikm_results_period` FOREIGN KEY (`period_id`) REFERENCES `survey_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ikm_results_opd` FOREIGN KEY (`opd_id`) REFERENCES `opds` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ikm_results_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Complaints Table
CREATE TABLE `complaints` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `response_id` bigint unsigned NULL DEFAULT NULL, -- Links to survey response if filed during survey
  `unit_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Anonymous',
  `contact` varchar(255) DEFAULT NULL, -- Phone or email
  `content` text NOT NULL,
  `status` enum('pending', 'resolved') NOT NULL DEFAULT 'pending',
  `follow_up_notes` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `complaints_unit_id_index` (`unit_id`),
  CONSTRAINT `fk_complaints_response` FOREIGN KEY (`response_id`) REFERENCES `survey_responses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Recommendations Table
CREATE TABLE `recommendations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint unsigned NOT NULL,
  `period_id` bigint unsigned NOT NULL,
  `content` text NOT NULL, -- Improvement recommendation
  `created_by` bigint unsigned NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recommendations_unit_id_index` (`unit_id`),
  KEY `recommendations_period_id_index` (`period_id`),
  CONSTRAINT `fk_recommendations_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recommendations_period` FOREIGN KEY (`period_id`) REFERENCES `survey_periods` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Follow Ups Table
CREATE TABLE `follow_ups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `recommendation_id` bigint unsigned NOT NULL,
  `action_plan` text NOT NULL,
  `progress_percentage` int unsigned NOT NULL DEFAULT 0,
  `status` enum('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
  `notes` text,
  `deadline` date DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `follow_ups_recommendation_id_index` (`recommendation_id`),
  CONSTRAINT `fk_follow_ups_recommendation` FOREIGN KEY (`recommendation_id`) REFERENCES `recommendations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. National Sync Logs Table
CREATE TABLE `national_sync_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `entity_type` varchar(100) NOT NULL, -- 'survey_response', 'ikm_aggregate'
  `entity_id` bigint unsigned NOT NULL,
  `status` enum('success', 'failed') NOT NULL,
  `response_message` text,
  `synced_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `national_sync_logs_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. API Tokens Table (Sanctum/Custom token table)
CREATE TABLE `api_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_tokens_token_unique` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. QR Codes Table
CREATE TABLE `qr_codes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint unsigned NOT NULL,
  `survey_id` bigint unsigned DEFAULT NULL,
  `target_url` varchar(2048) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `qr_codes_unit_id_index` (`unit_id`),
  CONSTRAINT `fk_qr_codes_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Settings Table
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Audit Logs Table
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NULL,
  `action` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `details` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_index` (`user_id`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- SEED DATA

-- Roles Seed
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Super Administrator', 'superadmin', 'Superadmin has global access to all settings, OPDs, units, logs and integration settings.', NOW(), NOW()),
(2, 'OPD Administrator', 'admin_opd', 'OPD admin manages their specific OPD, units, survey periods, recommendations and follow ups.', NOW(), NOW());

-- Permissions Seed
INSERT INTO `permissions` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Manage Settings', 'manage-settings', 'Manage national integration and regional settings', NOW(), NOW()),
(2, 'Manage Users', 'manage-users', 'Manage system users and role assignments', NOW(), NOW()),
(3, 'Manage OPDs', 'manage-opds', 'Manage regional OPD organizations', NOW(), NOW()),
(4, 'Manage Units', 'manage-units', 'Manage service units within OPDs', NOW(), NOW()),
(5, 'Manage Surveys', 'manage-surveys', 'Create, publish and manage surveys', NOW(), NOW()),
(6, 'View Analytics', 'view-analytics', 'View IKM real-time scores and statistics', NOW(), NOW()),
(7, 'Manage Complaints', 'manage-complaints', 'Manage public complaints and follow ups', NOW(), NOW()),
(8, 'Manage Recommendations', 'manage-recommendations', 'Manage recommendations and action plans', NOW(), NOW());

-- Role Permissions Mapping Seed
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1);
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES (4, 2), (5, 2), (6, 2), (7, 2), (8, 2);

-- Default Superadmin User (password: password)
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin Satukan', 'admin@satukan.test', NOW(), '$2y$12$7kP.Lg6.5g5vWzV1eB5QzO3j.lO0qO3XG8N3d7bN4j.7l2wzG5C2q', NOW(), NOW());

INSERT INTO `role_user` (`user_id`, `role_id`) VALUES (1, 1);

-- Default Settings Seed
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES
('national_sync_enabled', '1', NOW(), NOW()),
('national_api_endpoint', 'https://skm.panrb.go.id/api/v1/sync', NOW(), NOW()),
('national_api_token', 'token_dummy_national_skm_12345', NOW(), NOW()),
('regional_name', 'Pemerintah Kabupaten Satukan', NOW(), NOW()),
('regional_code', '7300', NOW(), NOW());
