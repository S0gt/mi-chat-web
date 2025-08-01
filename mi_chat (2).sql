-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 01-08-2025 a las 16:29:52
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mi_chat`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `amigos`
--

CREATE TABLE `amigos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `amigo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `amigos`
--

INSERT INTO `amigos` (`id`, `usuario_id`, `amigo_id`) VALUES
(1, 4, 5),
(3, 4, 6),
(2, 5, 4),
(4, 6, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupos`
--

INSERT INTO `grupos` (`id`, `nombre`, `avatar`, `descripcion`, `admin_id`) VALUES
(1, 'Penecillos', '688a8cae8fdcf.jpg', 'HOLA MUY BUENAS YO SOY ADRIAN Y QUIERO PEDIRLE UNA PIZZA FAMILIAR', NULL),
(2, 'Penecillos', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo_mensajes`
--

CREATE TABLE `grupo_mensajes` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo_mensaje` enum('texto','archivo','imagen') DEFAULT 'texto',
  `archivo_url` varchar(500) DEFAULT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  `editado` tinyint(1) DEFAULT 0,
  `fecha_edicion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo_miembros`
--

CREATE TABLE `grupo_miembros` (
  `grupo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupo_miembros`
--

INSERT INTO `grupo_miembros` (`grupo_id`, `usuario_id`) VALUES
(1, 4),
(1, 5),
(2, 4),
(2, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `de_id` int(11) NOT NULL,
  `para_id` int(11) NOT NULL,
  `texto` text NOT NULL,
  `fecha` datetime NOT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `estado` enum('enviado','entregado','leido') DEFAULT 'enviado',
  `fecha_entregado` timestamp NULL DEFAULT NULL,
  `fecha_leido` timestamp NULL DEFAULT NULL,
  `editado` tinyint(1) DEFAULT 0,
  `fecha_edicion` timestamp NULL DEFAULT NULL,
  `respondiendo_a` int(11) DEFAULT NULL,
  `tipo_mensaje` enum('texto','archivo','imagen','video','audio') DEFAULT 'texto',
  `archivo_url` varchar(500) DEFAULT NULL,
  `archivo_nombre` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id`, `de_id`, `para_id`, `texto`, `fecha`, `archivo`, `estado`, `fecha_entregado`, `fecha_leido`, `editado`, `fecha_edicion`, `respondiendo_a`, `tipo_mensaje`, `archivo_url`, `archivo_nombre`) VALUES
(1, 4, 5, 'hola', '2025-07-30 22:15:53', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(2, 5, 4, 'hola juan manteca', '2025-07-30 22:16:23', NULL, 'leido', NULL, '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(3, 4, 5, 'hola', '2025-07-30 22:25:25', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(4, 5, 4, 'hola', '2025-07-30 22:26:20', NULL, 'leido', NULL, '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(5, 5, 4, 'asdasd', '2025-07-30 22:28:05', NULL, 'leido', NULL, '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(6, 4, 5, 'hola', '2025-07-30 22:31:37', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(7, 4, 5, 'hola', '2025-07-30 22:35:22', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(8, 4, 5, 'hola', '2025-07-30 22:35:24', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(9, 5, 4, 'hola', '2025-07-30 22:35:40', NULL, 'leido', NULL, '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(10, 4, 5, 'adios', '2025-07-30 22:52:44', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(11, 4, 5, 'Hola buenas', '2025-07-30 23:41:13', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(12, 4, 5, 'hola', '2025-07-31 00:50:24', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(13, 4, 5, 'hola', '2025-07-31 13:31:42', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(14, 4, 5, 'hola', '2025-07-31 15:54:11', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(15, 4, 5, 'Hola', '2025-07-31 15:58:47', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(16, 4, 6, 'hola', '2025-07-31 15:59:08', NULL, 'enviado', NULL, NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(17, 4, 5, 'buenas genteee', '2025-07-31 16:15:48', NULL, 'entregado', '2025-07-31 14:15:48', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(18, 4, 5, 'BUENAS', '2025-07-31 16:40:23', NULL, 'entregado', '2025-07-31 14:40:23', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(19, 4, 5, 'hola', '2025-07-31 16:55:24', NULL, 'entregado', '2025-07-31 14:55:24', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(20, 4, 5, 'hola', '2025-07-31 16:55:30', NULL, 'entregado', '2025-07-31 14:55:30', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(21, 4, 5, 'sdasd', '2025-07-31 16:55:32', NULL, 'entregado', '2025-07-31 14:55:32', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(22, 4, 5, 'hola', '2025-07-31 16:55:44', NULL, 'entregado', '2025-07-31 14:55:44', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(23, 4, 5, 'buenas juan', '2025-07-31 17:16:39', NULL, 'entregado', '2025-07-31 15:16:39', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(24, 5, 4, 'buenaaa', '2025-07-31 17:16:57', NULL, 'leido', '2025-07-31 15:16:57', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(25, 5, 4, 'buenaaaaaaaas', '2025-07-31 17:17:56', NULL, 'leido', '2025-07-31 15:17:56', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(26, 5, 4, '1', '2025-07-31 17:18:53', NULL, 'leido', '2025-07-31 15:18:53', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(27, 4, 5, 'hola', '2025-07-31 17:19:02', NULL, 'entregado', '2025-07-31 15:19:02', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(28, 4, 5, 'hola', '2025-07-31 17:25:52', NULL, 'entregado', '2025-07-31 15:25:52', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(29, 4, 5, '123', '2025-07-31 17:26:00', NULL, 'entregado', '2025-07-31 15:26:00', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(30, 4, 5, 'buenas', '2025-07-31 17:41:46', NULL, 'entregado', '2025-07-31 15:41:46', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(31, 5, 4, 'buenas', '2025-07-31 17:41:57', NULL, 'leido', '2025-07-31 15:41:57', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(32, 5, 4, 'asd', '2025-07-31 17:42:06', NULL, 'leido', '2025-07-31 15:42:06', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(33, 5, 4, 'das', '2025-07-31 17:42:06', NULL, 'leido', '2025-07-31 15:42:06', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(34, 5, 4, 'd', '2025-07-31 17:42:06', NULL, 'leido', '2025-07-31 15:42:06', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(35, 5, 4, 'as', '2025-07-31 17:42:06', NULL, 'leido', '2025-07-31 15:42:06', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(36, 5, 4, 'hola', '2025-07-31 17:44:12', NULL, 'leido', '2025-07-31 15:44:12', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(37, 5, 4, 'hola', '2025-07-31 17:44:17', NULL, 'leido', '2025-07-31 15:44:17', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(38, 4, 5, 'hola', '2025-07-31 17:56:38', NULL, 'entregado', '2025-07-31 15:56:38', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(39, 5, 4, 'hola', '2025-07-31 17:56:46', NULL, 'leido', '2025-07-31 15:56:46', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(40, 5, 4, 'hola', '2025-07-31 17:56:54', NULL, 'leido', '2025-07-31 15:56:54', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(41, 5, 4, 'holha', '2025-07-31 17:56:59', NULL, 'leido', '2025-07-31 15:56:59', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(42, 5, 4, 'a', '2025-07-31 17:56:59', NULL, 'leido', '2025-07-31 15:56:59', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(43, 5, 4, 'sd', '2025-07-31 17:57:00', NULL, 'leido', '2025-07-31 15:57:00', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(44, 5, 4, 's', '2025-07-31 17:57:00', NULL, 'leido', '2025-07-31 15:57:00', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(45, 5, 4, 'd', '2025-07-31 17:57:00', NULL, 'leido', '2025-07-31 15:57:00', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(46, 5, 4, 'as', '2025-07-31 17:57:00', NULL, 'leido', '2025-07-31 15:57:00', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(47, 5, 4, 'hola', '2025-07-31 18:09:14', NULL, 'leido', '2025-07-31 16:09:14', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(48, 4, 5, 'hola', '2025-07-31 18:09:19', NULL, 'entregado', '2025-07-31 16:09:19', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(49, 4, 5, 'hola', '2025-07-31 18:10:11', NULL, 'entregado', '2025-07-31 16:10:11', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(50, 5, 4, 'hola', '2025-07-31 18:14:49', NULL, 'leido', '2025-07-31 16:14:49', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(51, 5, 4, 'hola', '2025-07-31 18:14:53', NULL, 'leido', '2025-07-31 16:14:53', '2025-07-31 18:51:13', 0, NULL, NULL, 'texto', NULL, NULL),
(52, 4, 5, 'sada', '2025-07-31 18:14:58', NULL, 'entregado', '2025-07-31 16:14:58', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(53, 4, 5, 'hola', '2025-07-31 20:51:15', NULL, 'entregado', '2025-07-31 18:51:15', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(54, 4, 5, 'asdas', '2025-07-31 20:51:18', NULL, 'entregado', '2025-07-31 18:51:18', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(55, 4, 5, 'das', '2025-07-31 20:51:18', NULL, 'entregado', '2025-07-31 18:51:18', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(56, 4, 5, 'd', '2025-07-31 20:51:18', NULL, 'entregado', '2025-07-31 18:51:18', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(57, 4, 5, 's', '2025-07-31 20:51:19', NULL, 'entregado', '2025-07-31 18:51:19', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(58, 4, 5, 'hola', '2025-07-31 20:58:22', NULL, 'entregado', '2025-07-31 18:58:22', NULL, 0, NULL, NULL, 'texto', NULL, NULL),
(59, 4, 6, 'dsa', '2025-07-31 20:58:42', NULL, 'entregado', '2025-07-31 18:58:42', NULL, 0, NULL, NULL, 'texto', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_grupo`
--

CREATE TABLE `mensajes_grupo` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `de_id` int(11) NOT NULL,
  `texto` text NOT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `fecha` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes_grupo`
--

INSERT INTO `mensajes_grupo` (`id`, `grupo_id`, `de_id`, `texto`, `archivo`, `fecha`) VALUES
(1, 1, 4, 'hola', NULL, '2025-07-30 22:59:26'),
(2, 1, 5, 'holiiii', NULL, '2025-07-30 22:59:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje_reacciones`
--

CREATE TABLE `mensaje_reacciones` (
  `id` int(11) NOT NULL,
  `mensaje_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `fecha_reaccion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `codigo` varchar(20) NOT NULL DEFAULT '',
  `avatar` varchar(255) DEFAULT '',
  `estado` varchar(100) DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `password`, `codigo`, `avatar`, `estado`, `email`, `descripcion`) VALUES
(4, 'JUANMANTECA', '$2y$10$VMfZ3LB9Ck0LsCMfqskSi.Pk9aIduz8.koFPkfm5oveXWLqvHHrH6', '4M1HS9', '688a8a9c13ff5.jpg', '', NULL, NULL),
(5, 'Juan', '$2y$10$104yNur9HFl6YuhDKLdYq.18xZfXltsgdERpWuDixivwfU3fMrC.W', 'PDCMZU', '', '', NULL, NULL),
(6, 'Roberto ', '$2y$10$NbpmNGUyEkOiIB0EVhSeE.m96WVERvkaeXiajqE7PsC778aRXSRwW', '3GYR5N', '', '', NULL, NULL),
(8, 'testuser', '$2y$10$1jde/M1UcDnZV9gxieTNHuCEMBD4PzYwuAqmF69ruvwUR3uY4ji8G', 'TEST001', '', '', NULL, NULL),
(9, 'testuser2', '$2y$10$i7NrE.U7fy3VpYecLsdPqer2puBcpvLgGqvYDsPlsPq4pW2O9FB7a', 'TEST002', '', '', 'test2@example.com', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `amigos`
--
ALTER TABLE `amigos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`,`amigo_id`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `grupo_mensajes`
--
ALTER TABLE `grupo_mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_grupo_mensajes_grupo` (`grupo_id`),
  ADD KEY `idx_grupo_mensajes_fecha` (`fecha_envio`);

--
-- Indices de la tabla `grupo_miembros`
--
ALTER TABLE `grupo_miembros`
  ADD KEY `idx_grupo_miembros_grupo` (`grupo_id`),
  ADD KEY `idx_grupo_miembros_usuario` (`usuario_id`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `de_id` (`de_id`),
  ADD KEY `para_id` (`para_id`);

--
-- Indices de la tabla `mensajes_grupo`
--
ALTER TABLE `mensajes_grupo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grupo_id` (`grupo_id`),
  ADD KEY `de_id` (`de_id`);

--
-- Indices de la tabla `mensaje_reacciones`
--
ALTER TABLE `mensaje_reacciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_reaction` (`mensaje_id`,`usuario_id`,`emoji`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `amigos`
--
ALTER TABLE `amigos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `grupo_mensajes`
--
ALTER TABLE `grupo_mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `mensajes_grupo`
--
ALTER TABLE `mensajes_grupo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `mensaje_reacciones`
--
ALTER TABLE `mensaje_reacciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `grupo_mensajes`
--
ALTER TABLE `grupo_mensajes`
  ADD CONSTRAINT `grupo_mensajes_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grupo_mensajes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `grupo_miembros`
--
ALTER TABLE `grupo_miembros`
  ADD CONSTRAINT `grupo_miembros_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`),
  ADD CONSTRAINT `grupo_miembros_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`de_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`para_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `mensajes_grupo`
--
ALTER TABLE `mensajes_grupo`
  ADD CONSTRAINT `mensajes_grupo_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`),
  ADD CONSTRAINT `mensajes_grupo_ibfk_2` FOREIGN KEY (`de_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `mensaje_reacciones`
--
ALTER TABLE `mensaje_reacciones`
  ADD CONSTRAINT `mensaje_reacciones_ibfk_1` FOREIGN KEY (`mensaje_id`) REFERENCES `mensajes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensaje_reacciones_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
