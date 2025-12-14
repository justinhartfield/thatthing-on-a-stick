CREATE TABLE `brand_concepts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`primaryColor` varchar(7) NOT NULL,
	`secondaryColor` varchar(7) NOT NULL,
	`accentColor` varchar(7) NOT NULL,
	`displayFont` varchar(100) NOT NULL,
	`bodyFont` varchar(100) NOT NULL,
	`visualStyle` varchar(100) NOT NULL,
	`moodboardImageUrl` text,
	`logoConceptImageUrl` text,
	`tagline` text,
	`toneOfVoice` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brand_concepts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brand_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`initialConcept` text NOT NULL,
	`currentPhase` enum('discovery','strategy','concepts','refinement','toolkit','completed') NOT NULL DEFAULT 'discovery',
	`discoveryAnswers` text,
	`strategyData` text,
	`selectedConceptId` int,
	`toolkitPdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brand_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
