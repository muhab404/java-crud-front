package com.webapp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final String URL = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/webapp");
    private static final String USERNAME = System.getenv().getOrDefault("DB_USERNAME", "dbadmin");
    private static final String PASSWORD = System.getenv().getOrDefault("DB_PASSWORD", "ChangeMe123!");

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }
}