CREATE DATABASE `VideoCapture`;

USE `VideoCapture`;

CREATE TABLE `metering` (
  `id` int(11) NOT NULL,
  `temp` int(11) NOT NULL,
  `humidity` varchar(150) NOT NULL,
  `lighting` varchar(150) NOT NULL,
  `datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `picturecapture` (
  `id` int(11) NOT NULL,
  `datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `filename` varchar(255) NOT NULL,
  `uploadDir` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `videocapture` (
  `id` int(11) NOT NULL,
  `datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `filename` varchar(255) NOT NULL,
  `uploadDir` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
