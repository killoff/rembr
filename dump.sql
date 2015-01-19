-- MySQL dump 10.13  Distrib 5.6.19, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: homestead
-- ------------------------------------------------------
-- Server version	5.6.19-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `homestead`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `homestead` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `homestead`;

--
-- Table structure for table `note`
--

DROP TABLE IF EXISTS `note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `note` (
  `note_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `text` text CHARACTER SET utf8mb4 NOT NULL,
  `uuid` varchar(150) NOT NULL,
  PRIMARY KEY (`note_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note`
--

LOCK TABLES `note` WRITE;
/*!40000 ALTER TABLE `note` DISABLE KEYS */;
INSERT INTO `note` VALUES (1,2,'sdfsdfkjsbdf',''),(2,2,' цтвашыивс ывиаи ывыв а-ываыв\nаы\nваыва\nы\nва\nываы\n\n4:     sdf df','5902d5a0-e8ef-4b43-820a-2474810df672');
/*!40000 ALTER TABLE `note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note_tag`
--

DROP TABLE IF EXISTS `note_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `note_tag` (
  `note_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  KEY `note_id` (`note_id`),
  KEY `tag_id` (`tag_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note_tag`
--

LOCK TABLES `note_tag` WRITE;
/*!40000 ALTER TABLE `note_tag` DISABLE KEYS */;
INSERT INTO `note_tag` VALUES (2,1),(2,2),(2,3),(2,4),(2,5);
/*!40000 ALTER TABLE `note_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tag` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`tag_id`),
  KEY `user_id` (`user_id`),
  KEY `name` (`name`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'tag1',2),(2,'tag44',2),(3,'так три четыва',2),(4,'tag',2),(5,'tag5',2);
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `external_id` varchar(200) NOT NULL,
  `external_info` varchar(1000) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `remember_token` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_external_id` (`external_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'killoff@gmail.com',NULL,'Dmitry Volik','google111225627451358768158','{\"id\":\"111225627451358768158\",\"email\":\"killoff@gmail.com\",\"verified_email\":true,\"name\":\"Dmitry Volik\",\"given_name\":\"Dmitry\",\"family_name\":\"Volik\",\"link\":\"https:\\/\\/plus.google.com\\/111225627451358768158\",\"picture\":\"https:\\/\\/lh3.googleusercontent.com\\/-XdUIqdMkCWA\\/AAAAAAAAAAI\\/AAAAAAAAAAA\\/4252rscbv5M\\/photo.jpg\",\"gender\":\"male\",\"locale\":\"en\"}','2014-12-30 23:54:29','2014-12-30 23:54:29','fzEVNrXAzmaec41KRev5bDjGSr8JeNRB9SfFOVUWFZuNVuKS2qkPElYaHJeJ'),(2,'dmytro.volyk@gmail.com',NULL,'Dmitriy Volik','fb1520029994927487','{\"id\":\"1520029994927487\",\"email\":\"dmytro.volyk@gmail.com\",\"first_name\":\"Dmitriy\",\"gender\":\"male\",\"last_name\":\"Volik\",\"link\":\"https:\\/\\/www.facebook.com\\/app_scoped_user_id\\/1520029994927487\\/\",\"locale\":\"en_US\",\"name\":\"Dmitriy Volik\",\"timezone\":1,\"updated_time\":\"2014-12-30T21:52:46+0000\",\"verified\":true}','2014-12-30 23:54:39','2014-12-30 23:54:39','KEXyow7llf1DNyEFxE6DRy7RsNr5YqiOQLHpNV0kOoeXIg1BVwHgUFMdrw2x');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-01-19 16:47:25
