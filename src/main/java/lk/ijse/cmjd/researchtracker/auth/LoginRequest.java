package lk.ijse.cmjd.researchtracker.auth;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}