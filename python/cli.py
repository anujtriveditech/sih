"""
AICTE SmartTrack - Python Execution CLI & Bridge Interface
Exposes JSON-in / JSON-out command-line interface for node/express full-stack runtime.
"""

import sys
import json
from typing import Dict, Any

from .rules_engine import ComplianceEngine
from .extractor import DocumentExtractionEngine
from .risk_engine import RiskScoreEngine
from .copilot_engine import AICopilotEngine
from .models import asdict

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified. Valid actions: validate, extract, score, copilot, sample"}))
        sys.exit(1)

    action = sys.argv[1].lower()

    # Read stdin payload if available
    input_data: Dict[str, Any] = {}
    if not sys.stdin.isatty():
        try:
            raw_input = sys.stdin.read().strip()
            if raw_input:
                input_data = json.loads(raw_input)
        except Exception as e:
            print(json.dumps({"error": f"Failed to parse JSON input: {str(e)}"}))
            sys.exit(1)

    if action == "validate":
        engine = ComplianceEngine()
        app_data = input_data.get("application", {})
        existing = input_data.get("existing_fdr_numbers", [])
        findings = engine.validate(app_data, existing)
        print(json.dumps([asdict(f) for f in findings], default=str))

    elif action == "extract":
        extractor = DocumentExtractionEngine()
        text = input_data.get("text", "")
        source_doc = input_data.get("source_document", "FDR_Document.pdf")
        fields = extractor.extract_from_text(text, source_doc)
        print(json.dumps({k: asdict(v) for k, v in fields.items()}, default=str))

    elif action == "score":
        scorer = RiskScoreEngine()
        app_data = input_data.get("application", {})
        findings = input_data.get("findings", [])
        result = scorer.calculate_score(app_data, findings)
        print(json.dumps(asdict(result), default=str))

    elif action == "copilot":
        copilot = AICopilotEngine()
        query = input_data.get("query", "")
        context_case = input_data.get("context_case")
        all_cases = input_data.get("all_cases", [])
        institutions = input_data.get("institutions", [])
        user_role = input_data.get("user_role")
        user_institution_id = input_data.get("user_institution_id")
        history = input_data.get("conversation_history", [])
        resp = copilot.process_query(
            query=query,
            context_case=context_case,
            all_cases=all_cases,
            institutions=institutions,
            user_role=user_role,
            user_institution_id=user_institution_id,
            conversation_history=history
        )
        print(json.dumps(resp, default=str))

    elif action == "sample":
        extractor = DocumentExtractionEngine()
        sample_key = input_data.get("sample_key", "hdfc_sample")
        sample_info = extractor.SAMPLE_TEMPLATES.get(sample_key, extractor.SAMPLE_TEMPLATES["hdfc_sample"])
        fields = extractor.extract_from_text(sample_info["text"], f"{sample_key}.pdf")
        print(json.dumps({
            "title": sample_info["title"],
            "text": sample_info["text"],
            "fields": {k: asdict(v) for k, v in fields.items()}
        }, default=str))

    else:
        print(json.dumps({"error": f"Unknown action '{action}'"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
