package nz.ac.uoa.g9.backend.ai;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import com.openai.client.OpenAIClient;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = LLMController.class)
class LLMControllerTest {

    @Autowired
    private MockMvc mvc;

    // The controller constructor needs an OpenAIClient; we mock it so the context loads.
    @MockitoBean
    private OpenAIClient openAIClient;

    @Test
    @DisplayName("GET /api/ai/ping returns 200 OK with 'ok'")
    void ping_returnsOk() throws Exception {
        mvc.perform(get("/api/ai/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"))
                .andExpect(content().contentType("text/plain;charset=UTF-8"));
    }
}