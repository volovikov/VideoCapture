-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Мар 04 2020 г., 19:37
-- Версия сервера: 8.0.12
-- Версия PHP: 5.5.38

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `videocapture`
--

-- --------------------------------------------------------

--
-- Структура таблицы `metering`
--

CREATE TABLE `metering` (
  `id` int(11) NOT NULL,
  `temp` int(11) NOT NULL,
  `humidity` varchar(150) NOT NULL,
  `lighting` varchar(150) NOT NULL,
  `datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `picturecapture`
--

CREATE TABLE `picturecapture` (
  `id` int(11) NOT NULL,
  `datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `filename` varchar(255) NOT NULL,
  `uploadDir` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
