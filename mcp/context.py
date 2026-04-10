class ContextManager:
    def __init__(self):
        self.history=[]

    def add_message(self, role , content):
        self.history.append({
            "role":role,
            "content":content
        })

    def get_context(self):
        return self.history
