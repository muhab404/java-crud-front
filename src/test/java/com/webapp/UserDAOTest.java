package com.webapp;

import org.junit.Test;
import static org.junit.Assert.*;

public class UserDAOTest {

    @Test
    public void testUserCreation() {
        User user = new User("John Doe", "john@example.com");
        assertEquals("John Doe", user.getName());
        assertEquals("john@example.com", user.getEmail());
    }

    @Test
    public void testUserWithId() {
        User user = new User(1, "Jane Doe", "jane@example.com");
        assertEquals(1, user.getId());
        assertEquals("Jane Doe", user.getName());
        assertEquals("jane@example.com", user.getEmail());
    }

    @Test
    public void testUserToString() {
        User user = new User(1, "Test User", "test@example.com");
        String expected = "User{id=1, name='Test User', email='test@example.com'}";
        assertEquals(expected, user.toString());
    }
}