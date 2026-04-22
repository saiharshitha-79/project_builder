// Engine logic enabling BOTH Mock and Real AI generation
export const AIEngine = {
  async fetchRealAI(systemInstruction, prompt) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY'); // Generic key
    const provider = localStorage.getItem('AI_PROVIDER') || 'Gemini';
    if (!apiKey) return null;

    try {
      if (provider === 'Gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ parts: [{ text: prompt }] }],
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates[0].content.parts[0].text;
      } 
      
      else if (provider === 'OpenAI') {
        const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
             model: 'gpt-4o',
             messages: [
               { role: 'system', content: systemInstruction },
               { role: 'user', content: prompt }
             ]
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
      }
      
      else if (provider === 'Groq') {
        const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
             model: 'llama3-8b-8192',
             messages: [
               { role: 'system', content: systemInstruction },
               { role: 'user', content: prompt }
             ]
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.error("AI Error:", e);
      return `[API Error]: ${e.message}\nProvider: ${provider}\nPlease check your API Key.`;
    }
  },

  async generateCode(prompt, level, language = "Python") {
    const realResponse = await this.fetchRealAI(
      `You are an AI that converts every user request into a programming solution. 1. Whatever the user asks (theory, question, topic), convert it into a working program. 2. Choose ${language}. 3. If theoretical, convert to simulation. If numerical, solve with step-by-step code. If system/design, build as software project. 4. Code must be clean, commented, runnable. FORMAT exactly as:\n### CODE\n[your code]\n### OUTPUT (Sample Run Explanation)\n[output]`,
      prompt
    );
    if (realResponse) return realResponse;

    await simulateDelay(2000);
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('student')) {
      if (language === 'Python') {
        return `### CODE\nclass StudentList:\n    def __init__(self):\n        self.students = []\n\n    def add_student(self, name, grade):\n        self.students.append({"name": name, "grade": grade})\n        print(f"Added {name}")\n\n    def display(self):\n        for s in self.students:\n            print(f"Student: {s['name']} | Grade: {s['grade']}")\n\n# Usage\nregistrar = StudentList()\nregistrar.add_student("Alice", "A")\nregistrar.display()\n\n### OUTPUT (Sample Run Explanation)\nAdded Alice\nStudent: Alice | Grade: A`;
      } else {
        return `### CODE\nclass StudentList {\n  constructor() {\n    this.students = [];\n  }\n  addStudent(name, grade) {\n    this.students.push({name, grade});\n    console.log("Added " + name);\n  }\n  display() {\n    console.table(this.students);\n  }\n}\n\nconst registrar = new StudentList();\nregistrar.addStudent("Alice", "A");\nregistrar.display();\n\n### OUTPUT (Sample Run Explanation)\nAdded Alice\n[Table Visualization: Alice, A]`;
      }
    }
    
    if (lowerPrompt.includes('neural') || lowerPrompt.includes('cnn')) {
       if (language === 'Python') {
         return `### CODE\nimport tensorflow as tf\nfrom tensorflow.keras import layers, models\n\ndef create_model():\n    model = models.Sequential([\n        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),\n        layers.MaxPooling2D((2, 2)),\n        layers.Flatten(),\n        layers.Dense(64, activation='relu'),\n        layers.Dense(10, activation='softmax')\n    ])\n    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])\n    return model\n\nmodel = create_model()\nmodel.summary()\n\n### OUTPUT (Sample Run Explanation)\nModel: "sequential"\nTotal params: 347,146\nThis CNN architecture compiles successfully for image classification tasks.`;
       }
    }
    
    if (lowerPrompt.includes('factorial')) {
      if (language === 'Python') {
        return `### CODE\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nif __name__ == "__main__":\n    num = 5\n    print(f"The factorial of {num} is {factorial(num)}")\n\n### OUTPUT (Sample Run Explanation)\nThe factorial of 5 is 120`;
      } else {
        return `### CODE\nfunction factorial(n) {\n  if (n === 0 || n === 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconst num = 5;\nconsole.log(\`The factorial of \${num} is \${factorial(num)}\`);\n\n### OUTPUT (Sample Run Explanation)\nThe factorial of 5 is 120`;
      }
    }

    if (language === 'Python') {
       return `### CODE\ndef main():\n    print("Initialization complete...")\n    # TODO: Add ${level} level core logic here\n\nif __name__ == "__main__":\n    main()\n\n### OUTPUT (Sample Run Explanation)\nInitialization complete...`;
    }

    return `### CODE\nfunction main() {\n  console.log("Initialization complete...");\n  // TODO: Add ${language} specific core logic here\n}\n\nmain();\n\n### OUTPUT (Sample Run Explanation)\nInitialization complete...`;
  },
  
  async generateReport(prompt) {
    const realResponse = await this.fetchRealAI(
      `Write a complete professional project report in English formatted like a college final-year project. Include exactly these sections: Title, Introduction, Problem Statement, Objective, Methodology / Working, Algorithm / Flow, System Design, Applications, Advantages, Future Scope, and Conclusion.`,
      prompt
    );
    if (realResponse) return realResponse;

    await simulateDelay(1500);
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('student')) {
      return `# Student Registry System - Final Report\n\n## 1. Title\nDynamic Object-Oriented Student Data Registry System\n\n## 2. Introduction\nManaging academic records computationally is a necessary baseline for institutional software.\n\n## 3. Problem Statement\nStatic data types fail to accommodate rotating student rosters efficiently.\n\n## 4. Objective\nDesign a dynamic array-based object list to handle O(1) appending.\n\n## 5. Methodology / Working\nThe core engine uses encapsulated class properties mapped to global instantiations.\n\n## 6. Algorithm / Flow\nIterative insertion array buffering.\n\n## 7. System Design\nClient-side script -> Memory Heap Array.\n\n## 8. Applications\nUsed natively in primary school CRMs.\n\n## 9. Advantages\nExtremely fast local execution with minimal memory footprint.\n\n## 10. Future Scope\nImplementation of a persistent SQL relational database.\n\n## 11. Conclusion\nThe system successfully tracks array-based dynamic memory allocations for student registries.`;
    }
    
    if (lowerPrompt.includes('neural') || lowerPrompt.includes('cnn')) {
      return `# Image Classification via CNN - Final Report\n\n## 1. Title\nHigh-Dimensional Feature Extraction using Convolutional Neural Networks\n\n## 2. Introduction\nDeep learning models have revolutionized computer vision tasks.\n\n## 3. Problem Statement\nTraditional ML algorithms fail to extract spatial hierarchies in raw pixel data.\n\n## 4. Objective\nImplement a robust Sequential CNN to classify arrays representing visual objects.\n\n## 5. Methodology / Working\nApplying continuous convolution operations coupled with ReLU activation to encode image features into latent representations.\n\n## 6. Algorithm / Flow\nFeedforward pass -> Loss Calculation (Categorical Crossentropy) -> Backpropagation (Adam Optimizer).\n\n## 7. System Design\nKeras Sequential API: Conv2D -> MaxPool2D -> Flatten -> Dense -> Softmax.\n\n## 8. Applications\nFacial recognition, medical imaging, and autonomous driving.\n\n## 9. Advantages\nAutomatic spatial pooling prevents overfitting and handles image translation invariance.\n\n## 10. Future Scope\nMigrating to transformers (ViT) or integrating advanced ResNet architectures.\n\n## 11. Conclusion\nCNNs remain the optimal baseline for robust baseline image classification tasks.`;
    }
    
    if (lowerPrompt.includes('factorial')) {
      return `# Mathematical Optimization: Factorial Generation - Final Report\n\n## 1. Title\nAlgorithmic Factorial Computation via Recursion\n\n## 2. Introduction\nThe objective was to implement a concise algorithm to compute the factorial of positive integers.\n\n## 3. Problem Statement\nIterative loops can become verbose and mathematically unintuitive when expressing factorial multiplication logic.\n\n## 4. Objective\nConstruct an efficient baseline recursive structure that mimics structural mathematics.\n\n## 5. Methodology / Working\nWe utilized a Recursive approach mapping the function to its own diminished equivalent natively.\n\n## 6. Algorithm / Flow\nIf N=0 | N=1 -> return 1. Else return N * factorial(N-1).\n\n## 7. System Design\nStandard call-stack memory assignment mapped in O(N) complexity.\n\n## 8. Applications\nApplied heavily in permutations, combinations, and probability engines.\n\n## 9. Advantages\nHighly concise visual source code maintaining strict alignment with core algorithmic principles.\n\n## 10. Future Scope\nTransitioning to dynamic programming and memoization to prevent stack overflow on large bounds.\n\n## 11. Conclusion\nRecursion provides an elegant mathematical syntax map for algorithmic data processing.`;
    }

    return `# Default Mock Report\n\n## 1. Title\nGeneric Implementation Project\n\n(Note: Add a Google Gemini API Key in the top right to generate a real robust college-level report for this prompt!)`;
  },
  
  async generatePPT(prompt) {
    const realResponse = await this.fetchRealAI(
      `Create PowerPoint slide content in English. Minimum 10-12 slides. Format must include: 1. Title Slide, 2. Introduction, 3. Problem Statement, 4. Objective, 5. Proposed Solution, 6. System Architecture / Design, 7. Working / Methodology, 8. Algorithm / Flow, 9. Applications, 10. Advantages, 11. Future Scope, 12. Conclusion. Use clear, simple, professional bullet points.`,
      prompt
    );
    if (realResponse) return realResponse;

    await simulateDelay(1500);
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('student')) {
       return `Slide 1: Title: Dynamic Student Record System\nSlide 2: Introduction - Managing academic entities via scripting.\nSlide 3: Problem Statement - Tracking data dynamically.\nSlide 4: Objective - Build an O(N) traversal list structure.\nSlide 5: Proposed Solution - Custom object classes.\nSlide 6: System Architecture - Linear array heap memory.\nSlide 7: Working - The .add() functional mapping.\nSlide 8: Algorithm Flow - Constructor > Input > Insertion.\nSlide 9: Applications - Simple grading CRMs.\nSlide 10: Advantages - Fast O(1) appends.\nSlide 11: Future Scope - SQL backend integration.\nSlide 12: Conclusion - Highly reliable frontend persistence.`;
    }
    
    if (lowerPrompt.includes('neural') || lowerPrompt.includes('cnn')) {
       return `Slide 1: Title: CNN Image Classification Model\nSlide 2: Introduction - Deep learning for computer vision.\nSlide 3: Problem Statement - Extracting spatial features.\nSlide 4: Objective - Design a sequential Keras model.\nSlide 5: Proposed Solution - Utilizing 2D Convolution mapping.\nSlide 6: System Architecture - Conv2D > MaxPool > Dense.\nSlide 7: Working - ReLU activation with Adam optimizing.\nSlide 8: Algorithm Flow - Forward pass -> Categorical loss -> Backprop.\nSlide 9: Applications - Diagnostics, facial ID, self-driving.\nSlide 10: Advantages - Handles translation invariance.\nSlide 11: Future Scope - ViT Transformer integrations.\nSlide 12: Conclusion - Highly robust validation scores.`;
    }
    
    if (lowerPrompt.includes('factorial')) {
       return `Slide 1: Title: Factorial Computation Algorithm\nSlide 2: Introduction - Finding integer product sequences.\nSlide 3: Problem Statement - Iteration verbosity constraints.\nSlide 4: Objective - Elegant logic mapping.\nSlide 5: Proposed Solution - Recursive function implementations.\nSlide 6: System Design - Call stack queuing methodology.\nSlide 7: Working - n * factorial(n-1).\nSlide 8: Algorithm Flow - Base check (0/1) -> Recurse -> Return.\nSlide 9: Applications - Statistical permutation modeling.\nSlide 10: Advantages - Clean, expressive mathematical code.\nSlide 11: Future Scope - Iterative DP memoization updates.\nSlide 12: Conclusion - Efficient O(N) execution times.`;
    }

    return `Slide 1: Title: ${prompt}\n(Add an API key to generate the full 12-slide standard PowerPoint generation automatically!)`;
  },
  
  async generateViva(prompt) {
    const realResponse = await this.fetchRealAI(
      `You are an academic examiner. Provide a few Viva (oral exam) Q&A questions and answers based on this project.`,
      prompt
    );
    if (realResponse) return realResponse;

    await simulateDelay(1000);
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('student')) {
      return `Q: Why did you use an array/list for the students instead of a dictionary/hashmap?\nA: An array maintains insertion order and is sufficient for basic iteration, though a hashmap with student IDs as keys would be O(1) for lookups.\n\nQ: How does the class structure encapsulate data?\nA: By leveraging constructors to safely sandbox state variables from global scope.`;
    }
    
    if (lowerPrompt.includes('neural') || lowerPrompt.includes('cnn')) {
      return `Q: Explain the role of MaxPooling2D in your architecture.\nA: It aggressively downsamples spatial dimensions, reducing parameters and computation while extracting the dominant robust features.\n\nQ: Why Adam optimization?\nA: Adam combines the best properties of AdaGrad and RMSProp for efficient gradients in sparse and noisy environments.`;
    }
    
    if (lowerPrompt.includes('factorial')) {
      return `Q: Why recursion instead of iteration for the factorial?\nA: Recursion is syntactically cleaner and mirrors the mathematical definition directly, though an iterative loop is generally more memory-efficient.\n\nQ: What happens if the input is a negative number?\nA: Currently, the generic algorithm would recurse infinitely until stack overflow. Basic validation guards should be added for production code.`;
    }

    return `Q: How does the offline sync mechanism work?\nA: By utilizing IndexedDB to queue actions and Web Workers to process them upon reconnect.\n\nQ: What architectural pattern is employed?\nA: Modular service-based generation.`;
  },
  
  async generateOutput(prompt, language) {
    const realResponse = await this.fetchRealAI(
      `Mock the exact console execution output/terminal text resulting from running the code for: ${prompt}.`,
      prompt
    );
    if (realResponse) return realResponse;

    await simulateDelay(2500);
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('student')) {
      return `> Executing script...\nAdded Alice\nStudent: Alice | Grade: A\n\n[Program exited cleanly in 0.04s]`;
    }
    if (lowerPrompt.includes('neural') || lowerPrompt.includes('cnn')) {
      return `> Executing train_model.py...\nModel: "sequential"\n_________________________________________________________________\nLayer (type)                 Output Shape              Param #   \n=================================================================\nconv2d (Conv2D)              (None, 26, 26, 32)        320       \n_________________________________________________________________\nmax_pooling_2d (MaxPooling2D)(None, 13, 13, 32)        0         \n_________________________________________________________________\nflatten (Flatten)            (None, 5408)              0         \n_________________________________________________________________\ndense (Dense)                (None, 64)                346176    \n_________________________________________________________________\ndense_1 (Dense)              (None, 10)                650       \n=================================================================\nTotal params: 347,146\nTrainable params: 347,146\nNon-trainable params: 0\nEpoch 1/10\n1875/1875 [==============================] - 20s 10ms/step - loss: 0.1423 - accuracy: 0.9575\nEpoch 2/10\n1875/1875 [==============================] - 19s 10ms/step - loss: 0.0515 - accuracy: 0.9840`;
    }
    
    if (lowerPrompt.includes('factorial')) {
      return `> Executing script...\nThe factorial of 5 is 120\n\n[Program exited cleanly in 0.02s]`;
    }
    return `> Execution Result\nInitialization complete...\n\n[Process terminated successfully]`;
  },

  async incrementalUpdate(section, existingContent, prompt) {
    const realResponse = await this.fetchRealAI(
      `You are iteratively updating an academic project. The user wants to: "${prompt}". Here is the existing content: \n\n${existingContent}\n\nPlease output the seamlessly updated text without discarding unaffected parts entirely.`,
      prompt
    );
    if (realResponse) return realResponse;

    await simulateDelay(1500);
    return `${existingContent}\n\n## [INCREMENTAL UPDATE]\nApplied: ${prompt}`;
  }
};

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
