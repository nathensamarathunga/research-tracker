package lk.ijse.cmjd.researchtracker.document;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<Document> createDocument(
            @RequestBody Document document,
            @RequestParam String projectId,
            @RequestParam String uploaderUsername
    ) {
        Document created = documentService.createDocument(document, projectId, uploaderUsername);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Document>> getDocumentsByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(documentService.getDocumentsByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable String id, @RequestBody Document updated) {
        return ResponseEntity.ok(documentService.updateDocument(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}