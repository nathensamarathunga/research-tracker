package lk.ijse.cmjd.researchtracker.document;

import lk.ijse.cmjd.researchtracker.project.Project;
import lk.ijse.cmjd.researchtracker.project.ProjectRepository;
import lk.ijse.cmjd.researchtracker.user.User;
import lk.ijse.cmjd.researchtracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Value("${document.upload.dir:uploads}")
    private String uploadDir;

    public Document createDocument(Document document, String projectId, String uploaderUsername) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User uploader = userRepository.findByUsername(uploaderUsername);
        if (uploader == null) {
            throw new RuntimeException("User not found");
        }
        document.setProject(project);
        document.setUploadedBy(uploader);
        document.setUploadedAt(LocalDateTime.now());
        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByProject(String projectId) {
        return documentRepository.findByProjectId(projectId);
    }

    public Optional<Document> getDocumentById(String id) {
        return documentRepository.findById(id);
    }

    public Document updateDocument(String id, Document updated) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        doc.setTitle(updated.getTitle());
        doc.setDescription(updated.getDescription());
        return documentRepository.save(doc);
    }

    public void deleteDocument(String id) {
        Document doc = documentRepository.findById(id).orElse(null);
        if (doc != null) {
            // Delete file from disk
            if (doc.getUrlOrPath() != null) {
                try {
                    java.nio.file.Files.deleteIfExists(java.nio.file.Path.of(doc.getUrlOrPath()));
                } catch (Exception e) {
                    // Optionally log the error, but continue to delete the DB record
                    e.printStackTrace();
                }
            }
            documentRepository.deleteById(id);
        }
    }

    public Document uploadFile(MultipartFile file, String projectId, String uploaderUsername, String title, String description) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User uploader = userRepository.findByUsername(uploaderUsername);
        if (uploader == null) {
            throw new RuntimeException("User not found");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uuid = UUID.randomUUID().toString();
        String originalFileName = file.getOriginalFilename();
        String storedFileName = uuid + "_" + originalFileName;
        Path filePath = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Document doc = new Document();
        doc.setId(uuid);
        doc.setProject(project);
        doc.setTitle(title != null ? title : originalFileName);
        doc.setDescription(description);
        doc.setUrlOrPath(filePath.toString());
        doc.setFileType(file.getContentType());
        doc.setUploadedBy(uploader);
        doc.setUploadedAt(LocalDateTime.now());

        return documentRepository.save(doc);
    }

    public Optional<Path> getFilePathByDocumentId(String id) {
        return documentRepository.findById(id)
                .map(doc -> Paths.get(doc.getUrlOrPath()));
    }
}