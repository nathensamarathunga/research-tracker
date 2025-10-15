package lk.ijse.cmjd.researchtracker.document;

import lk.ijse.cmjd.researchtracker.project.Project;
import lk.ijse.cmjd.researchtracker.project.ProjectRepository;
import lk.ijse.cmjd.researchtracker.user.User;
import lk.ijse.cmjd.researchtracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Document createDocument(Document document, String projectId, String uploaderUsername) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User uploader = userRepository.findByUsername(uploaderUsername);
        document.setProject(project);
        document.setUploadedBy(uploader);
        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByProject(String projectId) {
        return documentRepository.findByProjectId(projectId);
    }

    public Optional<Document> getDocumentById(String id) {
        return documentRepository.findById(id);
    }

    public Document updateDocument(String id, Document updated) {
        return documentRepository.findById(id).map(doc -> {
            doc.setTitle(updated.getTitle());
            doc.setDescription(updated.getDescription());
            doc.setUrl(updated.getUrl());
            doc.setUploadedAt(updated.getUploadedAt());
            return documentRepository.save(doc);
        }).orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public void deleteDocument(String id) {
        documentRepository.deleteById(id);
    }
}