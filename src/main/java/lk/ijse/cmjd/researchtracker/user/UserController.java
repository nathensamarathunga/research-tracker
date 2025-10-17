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