package lk.ijse.cmjd.researchtracker.milestone;

import jakarta.persistence.*;
import lk.ijse.cmjd.researchtracker.project.Project;
import lk.ijse.cmjd.researchtracker.user.User;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "milestones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Milestone {

    @Id
    private String id = UUID.randomUUID().toString();

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private String title;

    private String description;

    private LocalDate dueDate;

    private boolean isCompleted = false;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
}