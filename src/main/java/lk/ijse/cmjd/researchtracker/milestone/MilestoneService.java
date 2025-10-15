package lk.ijse.cmjd.researchtracker.milestone;

import lk.ijse.cmjd.researchtracker.project.Project;
import lk.ijse.cmjd.researchtracker.project.ProjectRepository;
import lk.ijse.cmjd.researchtracker.user.User;
import lk.ijse.cmjd.researchtracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MilestoneService {
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Milestone createMilestone(String projectId, Milestone milestone, String creatorUsername) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User creator = userRepository.findByUsername(creatorUsername);
        if (creator == null) throw new RuntimeException("User not found");
        milestone.setId(UUID.randomUUID().toString());
        milestone.setProject(project);
        milestone.setCreatedBy(creator);
        milestone.setCreatedAt(LocalDateTime.now());
        milestone.setCompleted(false);
        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getMilestonesByProject(String projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }

    public Optional<Milestone> getMilestoneById(String id) {
        return milestoneRepository.findById(id);
    }

    public Milestone updateMilestone(String id, Milestone updated) {
        return milestoneRepository.findById(id).map(m -> {
            m.setTitle(updated.getTitle());
            m.setDescription(updated.getDescription());
            m.setDueDate(updated.getDueDate());
            m.setCompleted(updated.isCompleted());
            return milestoneRepository.save(m);
        }).orElseThrow(() -> new RuntimeException("Milestone not found"));
    }

    public void deleteMilestone(String id) {
        milestoneRepository.deleteById(id);
    }
}