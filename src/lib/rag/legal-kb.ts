/**
 * Static Legal Knowledge Base — procedural law concepts, terminology, limitation periods.
 * Used for GENERAL_LEGAL queries without RAG retrieval.
 */

export interface LegalEntry {
  term: string;
  definition: string;
  category: 'terminology' | 'procedure' | 'limitation' | 'appeal' | 'compliance' | 'governance';
  related_terms?: string[];
}

export const LEGAL_KB: LegalEntry[] = [
  // ─── Core Terminology ───
  {
    term: 'Contempt of Court',
    definition: 'Willful disobedience of a court order or disrespect to the court that obstructs administration of justice. Under the Contempt of Courts Act, 1971, it includes civil contempt (willful disobedience of any judgment, decree, direction, order, writ, or other process of a court) and criminal contempt (acts that scandalize or lower the authority of the court). Punishable with imprisonment up to 6 months and/or fine up to ₹2,000.',
    category: 'terminology',
    related_terms: ['Civil Contempt', 'Criminal Contempt', 'Willful Disobedience'],
  },
  {
    term: 'Writ Petition',
    definition: 'A formal written order issued by a court directing a person or authority to do or refrain from doing something. Under Article 226 of the Constitution of India, High Courts can issue writs of Habeas Corpus (personal liberty), Mandamus (compelling performance of duty), Certiorari (quashing orders), Prohibition (preventing action), and Quo Warranto (questioning authority to hold office). Under Article 32, the Supreme Court can issue these writs for enforcement of fundamental rights.',
    category: 'terminology',
    related_terms: ['Article 226', 'Article 32', 'Habeas Corpus', 'Mandamus', 'Certiorari'],
  },
  {
    term: 'Public Interest Litigation (PIL)',
    definition: 'A legal action initiated in a court of law for the enforcement of public interest where the affected party may not be in a position to approach the court themselves. PILs can be filed by any citizen under Article 32 (Supreme Court) or Article 226 (High Court). The court may take suo motu cognizance of matters involving public interest.',
    category: 'terminology',
    related_terms: ['Article 32', 'Article 226', 'Suo Motu'],
  },
  {
    term: 'Special Leave Petition (SLP)',
    definition: 'A petition under Article 136 of the Constitution seeking leave to appeal to the Supreme Court against any judgment, decree, determination, sentence, or order passed by any court or tribunal in India. The Supreme Court has discretionary power to grant leave. The limitation period for filing an SLP is 90 days from the date of the order being challenged.',
    category: 'terminology',
    related_terms: ['Article 136', 'Supreme Court', 'Appeal'],
  },
  {
    term: 'Suo Motu',
    definition: 'Latin for "on its own motion." When a court takes cognizance of a matter and initiates proceedings without any party filing a formal complaint or petition. Courts may act suo motu based on newspaper reports, letters, or other information that reveals violation of fundamental rights or public interest.',
    category: 'terminology',
  },
  {
    term: 'Interim Order / Stay Order',
    definition: 'A temporary order passed by a court during the pendency of a case to prevent any party from taking action that may cause irreparable harm. Stay orders maintain status quo until the final hearing. They are subject to conditions imposed by the court and can be vacated upon application.',
    category: 'terminology',
    related_terms: ['Status Quo', 'Injunction', 'Ad Interim'],
  },
  // ─── Appeal Procedures ───
  {
    term: 'Appeal to Division Bench',
    definition: 'An intra-court appeal from a single judge order to a division bench (two or more judges) of the same High Court. Filed under the Letters Patent Appeal provisions or relevant statutes. Typically must be filed within 30 days of the impugned order.',
    category: 'appeal',
    related_terms: ['Letters Patent Appeal', 'Intra-Court Appeal'],
  },
  {
    term: 'Review Petition',
    definition: 'A petition filed under Order 47 Rule 1 of the CPC (or Article 137 for the Supreme Court) to review a judgment or order on grounds of: discovery of new evidence, mistake apparent on the face of the record, or any other sufficient reason. Must be filed within 30 days of the order. Review is heard by the same judge/bench that passed the original order.',
    category: 'appeal',
    related_terms: ['Order 47 CPC', 'Article 137', 'Curative Petition'],
  },
  {
    term: 'Curative Petition',
    definition: 'A last resort remedy available in the Supreme Court after dismissal of a review petition. Introduced in Rupa Ashok Hurra v. Ashok Hurra (2002). Must demonstrate violation of principles of natural justice or that the case was not heard by the court. Placed before the three senior-most judges of the Supreme Court.',
    category: 'appeal',
  },
  // ─── Limitation Periods ───
  {
    term: 'Limitation Period — High Court Appeal',
    definition: 'Under the Limitation Act, 1963: Appeal to High Court from original decree — 90 days. Appeal from appellate decree — 30 days. Application for revision — 90 days. Letters Patent Appeal — 30 days (may vary by state).',
    category: 'limitation',
  },
  {
    term: 'Limitation Period — Supreme Court',
    definition: 'SLP under Article 136 — 90 days from the date of impugned order. Appeal under any statute — as prescribed in respective statute. Review Petition — 30 days. Curative Petition — no specific limitation but must show sufficient cause for delay.',
    category: 'limitation',
  },
  {
    term: 'Condonation of Delay',
    definition: 'Under Section 5 of the Limitation Act, 1963, a court may condone delay in filing an appeal or application if the applicant shows "sufficient cause" for the delay. The burden of proof lies on the applicant. Courts generally adopt a liberal approach if the delay is not inordinate and is satisfactorily explained.',
    category: 'limitation',
    related_terms: ['Section 5 Limitation Act', 'Sufficient Cause'],
  },
  // ─── Compliance & Governance ───
  {
    term: 'Compliance Affidavit',
    definition: 'A sworn statement filed before the court confirming that the party has complied with the court\'s directions. Must detail specific actions taken, dates of compliance, and supporting documentation. Non-filing of compliance affidavit within the stipulated time may lead to contempt proceedings.',
    category: 'compliance',
  },
  {
    term: 'Show Cause Notice',
    definition: 'A notice issued by the court or authority requiring a party to explain why a certain action should not be taken against them. In contempt proceedings, the court issues a show cause notice directing the alleged contemnor to explain why they should not be held in contempt for non-compliance.',
    category: 'compliance',
  },
  {
    term: 'Government Order (GO)',
    definition: 'An executive order issued by a government department implementing a policy, directive, or court order. In the context of court compliance, a GO may be issued to operationalize the court\'s directions across departments. Government orders are published in the official gazette.',
    category: 'governance',
  },
  {
    term: 'Mandamus',
    definition: 'A writ issued by a High Court or Supreme Court commanding a public authority to perform a public duty that it has failed or refused to perform. Cannot be issued against a private individual. The applicant must show a legal right to the performance of the duty and that the authority has failed to perform it despite demand.',
    category: 'terminology',
    related_terms: ['Article 226', 'Public Duty', 'Writ Petition'],
  },
];

/**
 * Search the legal knowledge base by keyword matching.
 */
export function searchLegalKB(query: string): LegalEntry[] {
  const q = query.toLowerCase();
  const results: { entry: LegalEntry; score: number }[] = [];

  for (const entry of LEGAL_KB) {
    let score = 0;
    const termLower = entry.term.toLowerCase();
    const defLower = entry.definition.toLowerCase();

    // Exact term match
    if (q.includes(termLower)) score += 10;

    // Partial term match
    const termWords = termLower.split(/\s+/);
    for (const tw of termWords) {
      if (tw.length > 3 && q.includes(tw)) score += 3;
    }

    // Related terms match
    if (entry.related_terms) {
      for (const rt of entry.related_terms) {
        if (q.includes(rt.toLowerCase())) score += 5;
      }
    }

    // Query words in definition
    const queryWords = q.split(/\s+/).filter(w => w.length > 3);
    for (const qw of queryWords) {
      if (defLower.includes(qw)) score += 1;
    }

    if (score > 0) {
      results.push({ entry, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3).map(r => r.entry);
}
