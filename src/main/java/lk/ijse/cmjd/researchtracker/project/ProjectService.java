package lk.ijse.cmjd.researchtracker.project;

import lk.ijse.cmjd.researchtracker.user.User;
import lk.ijse.cmjd.researchtracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    // Add a member
    public Project addMember(String projectId, String username) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findByUsername(username);
        if (user == null) throw new RuntimeException("User not found");
        project.getMembers().add(user);
        return projectRepository.save(project);
    }

    // Remove a member
    public Project removeMember(String projectId, String username) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findByUsername(username);
        if (user == null) throw new RuntimeException("User not found");
        project.getMembers().remove(user);
        return projectRepository.save(project);
    }

    // List members
    public Set<User> listMembers(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return project.getMembers();
    }

    public Project createProject(Project project, String piUsername) {
        User pi = userRepository.findByUsername(piUsername);
        project.setPi(pi);
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Project updateProject(String id, Project updatedProject) {
        return projectRepository.findById(id).map(project -> {
            project.setTitle(updatedProject.getTitle());
            project.setSummary(updatedProject.getSummary());
            project.setStatus(updatedProject.getStatus());
            project.setTags(updatedProject.getTags());
            project.setStartDate(updatedProject.getStartDate());
            project.setEndDate(updatedProject.getEndDate());
            project.setUpdatedAt(updatedProject.getUpdatedAt());
            return projectRepository.save(project);
        }).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public void deleteProject(String id) {
        projectRepository.deleteById(id);
    }

    public Project updateStatus(String projectId, Project.Status status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus(status);
        project.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }
}