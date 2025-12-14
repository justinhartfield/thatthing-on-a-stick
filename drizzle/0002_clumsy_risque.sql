ALTER TABLE `chat_messages` MODIFY COLUMN `role` enum('user','assistant') NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `answerChoices` text;--> statement-breakpoint
ALTER TABLE `chat_messages` DROP COLUMN `metadata`;