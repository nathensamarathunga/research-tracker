package lk.ijse.cmjd.researchtracker.milestone;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MilestoneController {
    private final MilestoneService milestoneService;

    // List milestones for a project
    @GetMapping("/api/projects/{projectId}/milestones")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Milestone>> getMilestonesByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(milestoneService.getMilestonesByProject(projectId));
    }

    // Add milestone
    @PostMapping("/api/projects/{projectId}/milestones")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Milestone> createMilestone(
            @PathVariable String projectId,
            @RequestBody Milestone milestone,
            @RequestParam String creatorUsername
    ) {
        Milestone created = milestoneService.createMilestone(projectId, milestone, creatorUsername);
        return ResponseEntity.ok(created);
    }

    // Update milestone
    @PutMapping("/api/milestones/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Milestone> updateMilestone(@PathVariable String id, @RequestBody Milestone updated) {
        return ResponseEntity.ok(milestoneService.updateMilestone(id, updated));
    }

    // Delete milestone
    @DeleteMapping("/api/milestones/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<?> deleteMilestone(@PathVariable String id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }
}