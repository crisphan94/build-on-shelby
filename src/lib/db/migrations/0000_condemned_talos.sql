CREATE TABLE `datasets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`size_bytes` integer NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text,
	`merkle_root` text NOT NULL,
	`blob_url` text NOT NULL,
	`uploader_addr` text,
	`download_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `datasets_blob_url_unique` ON `datasets` (`blob_url`);