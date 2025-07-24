package com.example.Grocito.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class for centralized logger creation
 */
public class LoggerConfig {

    /**
     * Creates a logger for the specified class
     * 
     * @param clazz The class to create the logger for
     * @return The logger instance
     */
    public static Logger getLogger(Class<?> clazz) {
        return LoggerFactory.getLogger(clazz);
    }
}