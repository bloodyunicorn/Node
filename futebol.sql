-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 17-Jun-2023 às 14:52
-- Versão do servidor: 10.4.28-MariaDB
-- versão do PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `futebol`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `clube`
--

CREATE TABLE `clube` (
  `Id` int(11) NOT NULL,
  `Nome` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `clube`
--

INSERT INTO `clube` (`Id`, `Nome`) VALUES
(1, 'Barcelona FC'),
(2, 'Real Madrid CF'),
(3, 'Manchester United'),
(4, 'Bayern Munich'),
(5, 'Juventus FC');

-- --------------------------------------------------------

--
-- Estrutura da tabela `jogador`
--

CREATE TABLE `jogador` (
  `Id` int(11) NOT NULL,
  `Nome` varchar(100) DEFAULT NULL,
  `IdClube` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `jogador`
--

INSERT INTO `jogador` (`Id`, `Nome`, `IdClube`) VALUES
(1, 'Lionel Messi', 1),
(2, 'Cristiano Ronaldo', 5),
(3, 'Neymar Jr.', 1),
(4, 'Sergio Ramos', 2),
(5, 'Robert Lewandowski', 4);

-- --------------------------------------------------------

--
-- Estrutura da tabela `resultado`
--

CREATE TABLE `resultado` (
  `Id` int(11) NOT NULL,
  `IdClubeHome` int(11) NOT NULL,
  `IdClubeAway` int(11) NOT NULL,
  `Score` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `clube`
--
ALTER TABLE `clube`
  ADD PRIMARY KEY (`Id`);

--
-- Índices para tabela `jogador`
--
ALTER TABLE `jogador`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IdClube` (`IdClube`);

--
-- Índices para tabela `resultado`
--
ALTER TABLE `resultado`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IdClubeHome` (`IdClubeHome`),
  ADD KEY `IdClubeAway` (`IdClubeAway`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `resultado`
--
ALTER TABLE `resultado`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `jogador`
--
ALTER TABLE `jogador`
  ADD CONSTRAINT `jogador_ibfk_1` FOREIGN KEY (`IdClube`) REFERENCES `clube` (`Id`);

--
-- Limitadores para a tabela `resultado`
--
ALTER TABLE `resultado`
  ADD CONSTRAINT `resultado_ibfk_1` FOREIGN KEY (`IdClubeHome`) REFERENCES `clube` (`Id`),
  ADD CONSTRAINT `resultado_ibfk_2` FOREIGN KEY (`IdClubeAway`) REFERENCES `clube` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
