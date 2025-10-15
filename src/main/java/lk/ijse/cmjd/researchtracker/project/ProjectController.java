package lk.ijse.cmjd.researchtracker.project;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lk.ijse.cmjd.researchtracker.user.User;

import java.util.Set;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PI')")
    public ResponseEntity<Project> createProject(@RequestBody Project project, @RequestParam String piUsername) {
        Project created = projectService.createProject(project, piUsername);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI')")
    public ResponseEntity<Project> updateProject(@PathVariable String id, @RequestBody Project updatedProject) {
        return ResponseEntity.ok(projectService.updateProject(id, updatedProject));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI')")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // Add a member
    @PostMapping("/{projectId}/members")
    @PreAuthorize("hasAnyRole('ADMIN','PI')")
    public ResponseEntity<?> addMember(
            @PathVariable String projectId,
            @RequestBody AddMemberRequest request
    ) {
        projectService.addMember(projectId, request.getUsername());
        return ResponseEntity.ok().build();
    }

    // Remove a member
    @DeleteMapping("/{projectId}/members/{username}")
    @PreAuthorize("hasAnyRole('ADMIN','PI')")
    public ResponseEntity<?> removeMember(
            @PathVariable String projectId,
            @PathVariable String username
    ) {
        projectService.removeMember(projectId, username);
        return ResponseEntity.noContent().build();
    }

    // List members
    @GetMapping("/{projectId}/members")
    @PreAuthorize("hasAnyRole('ADMIN','PI','MEMBER')")
    public ResponseEntity<Set<User>> listMembers(
            @PathVariable String projectId
    ) {
        return ResponseEntity.ok(projectService.listMembers(projectId));
    }

    // DTO for add member
    public static class AddMemberRequest {
        private String username;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
}