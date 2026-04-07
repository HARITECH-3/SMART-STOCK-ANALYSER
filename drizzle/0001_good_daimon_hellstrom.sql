CREATE TABLE `portfolio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`companyName` varchar(255),
	`shares` int NOT NULL,
	`averageCost` int NOT NULL,
	`currentPrice` int,
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`date` timestamp NOT NULL,
	`open` int,
	`high` int,
	`low` int,
	`close` int,
	`volume` varchar(50),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`companyName` varchar(255),
	`currentPrice` int,
	`previousClose` int,
	`dayHigh` int,
	`dayLow` int,
	`marketCap` varchar(50),
	`peRatio` varchar(20),
	`dividendYield` varchar(20),
	`volume` varchar(50),
	`change` varchar(20),
	`changePercent` varchar(20),
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stockCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `stockCache_ticker_unique` UNIQUE(`ticker`)
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`companyName` varchar(255),
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `portfolio` ADD CONSTRAINT `portfolio_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `watchlist` ADD CONSTRAINT `watchlist_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;