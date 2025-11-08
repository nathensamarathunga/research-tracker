package lk.ijse.cmjd.researchtracker.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // List all users (Admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Endpoint to get users by role (e.g. /api/users/role/PI)
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN','PI')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            String roleUpper = role.toUpperCase();
            // If requesting PI specifically, we can use the dedicated service method
            if ("PI".equals(roleUpper)) {
                return ResponseEntity.ok(userService.getPIUsers());
            }
            // Fallback: filter all users by role name
            List<User> users = userService.getAllUsers().stream()
                    .filter(u -> u.getRole().name().equalsIgnoreCase(roleUpper))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    // List all users for project membership (Admin and PI), EXCLUDING ADMINS
    @GetMapping("/all-for-membership")
    @PreAuthorize("hasAnyRole('ADMIN','PI')")
    public ResponseEntity<List<User>> getAllForMembership() {
        List<User> usersNoAdmins = userService.getAllUsers().stream()
                .filter(u -> u.getRole() != UserRole.ADMIN)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usersNoAdmins);
    }

    // Get user profile by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PI','MEMBER','VIEWER')")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete user (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}