from django.test import TestCase
from .views import _extract_lead_context, _has_complete_quote


class QuoteCaptureTests(TestCase):
    def test_extract_lead_context_finds_budget_and_contact(self):
        text = "I need a website with 5 pages. Budget 300 USD. My name is Jane Doe. Email jane@example.com"
        data = _extract_lead_context(text)
        self.assertEqual(data['budget'], '$300')
        self.assertEqual(data['name'], 'Jane Doe')
        self.assertEqual(data['email'], 'jane@example.com')

    def test_has_complete_quote_requires_name_and_contact(self):
        self.assertFalse(_has_complete_quote({'name': '', 'project_details': 'Website', 'email': ''}))
        self.assertTrue(_has_complete_quote({'name': 'Jane', 'project_details': 'Website', 'email': 'jane@example.com'}))
