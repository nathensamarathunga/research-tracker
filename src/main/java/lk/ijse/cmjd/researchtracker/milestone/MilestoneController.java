package lk.ijse.cmjd.researchtracker.milestone;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
public class MilestoneController {
    private final MilestoneService milestoneService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Milestone> createMilestone(
            @RequestBody Milestone milestone,
            @RequestParam String projectId,
            @RequestParam String creatorUsername
    ) {
        Milestone created = milestoneService.createMilestone(milestone, projectId, creatorUsername);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Milestone>> getMilestonesByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(milestoneService.getMilestonesByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Milestone> getMilestoneById(@PathVariable String id) {
        return milestoneService.getMilestoneById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Milestone> updateMilestone(@PathVariable String id, @RequestBody Milestone updated) {
        return ResponseEntity.ok(milestoneService.updateMilestone(id, updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<?> deleteMilestone(@PathVariable String id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }
}