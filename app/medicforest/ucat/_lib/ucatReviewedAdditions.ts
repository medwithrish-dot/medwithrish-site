import type { UCATQuestion, UCATSection } from "./ucatQuestionBank";

// Small authored sets, reviewed for answer correctness before entering the quality gate.
export const REVIEWED_UCAT_ADDITIONS = {
  "vr": [
    {
      "id": "vr-reviewed-oct26-01",
      "section": "vr",
      "subtype": "vr-detail",
      "title": "Practice",
      "stimulus": [
        "A coastal archive moved its photographic collection into a searchable catalogue. Before the move, visitors could request only photographs whose dates they already knew. The new catalogue also allows searches by place and subject. Volunteers supplied descriptions, which staff checked against the original records before publishing.",
        "During the first six months, remote enquiries increased while visits to the reading room stayed broadly unchanged. The archive did not charge for searches, but high-resolution reproductions continued to attract a fee. Staff cautioned that the rise in remote enquiries could partly reflect a local history festival held during the same period."
      ],
      "question": "Which search facility became available with the new catalogue?",
      "options": [
        {
          "key": "A",
          "text": "Searching by place"
        },
        {
          "key": "B",
          "text": "Searching by known date only"
        },
        {
          "key": "C",
          "text": "Obtaining every reproduction free"
        },
        {
          "key": "D",
          "text": "Searching unchecked descriptions"
        }
      ],
      "answer": "A",
      "explanation": "The new catalogue adds searches by place and subject. Dates were already used; reproductions still cost money and descriptions were checked.",
      "tags": [
        "medium"
      ],
      "setId": "vr-coastal-archive-oct26"
    },
    {
      "id": "vr-reviewed-oct26-02",
      "section": "vr",
      "subtype": "vr-inference",
      "title": "Practice",
      "stimulus": [
        "A coastal archive moved its photographic collection into a searchable catalogue. Before the move, visitors could request only photographs whose dates they already knew. The new catalogue also allows searches by place and subject. Volunteers supplied descriptions, which staff checked against the original records before publishing.",
        "During the first six months, remote enquiries increased while visits to the reading room stayed broadly unchanged. The archive did not charge for searches, but high-resolution reproductions continued to attract a fee. Staff cautioned that the rise in remote enquiries could partly reflect a local history festival held during the same period."
      ],
      "question": "What is best supported about the increase in remote enquiries?",
      "options": [
        {
          "key": "A",
          "text": "It was entirely caused by the festival"
        },
        {
          "key": "B",
          "text": "It replaced most reading-room visits"
        },
        {
          "key": "C",
          "text": "The catalogue may not be the only cause"
        },
        {
          "key": "D",
          "text": "It led to a new search fee"
        }
      ],
      "answer": "C",
      "explanation": "Staff identify the festival as another possible influence. Visits were broadly unchanged and searches remained free.",
      "tags": [
        "medium"
      ],
      "setId": "vr-coastal-archive-oct26"
    },
    {
      "id": "vr-reviewed-oct26-03",
      "section": "vr",
      "subtype": "vr-tfc",
      "title": "Practice",
      "stimulus": [
        "A coastal archive moved its photographic collection into a searchable catalogue. Before the move, visitors could request only photographs whose dates they already knew. The new catalogue also allows searches by place and subject. Volunteers supplied descriptions, which staff checked against the original records before publishing.",
        "During the first six months, remote enquiries increased while visits to the reading room stayed broadly unchanged. The archive did not charge for searches, but high-resolution reproductions continued to attract a fee. Staff cautioned that the rise in remote enquiries could partly reflect a local history festival held during the same period."
      ],
      "question": "Every volunteer description was published without staff review. According to the passage, this statement is:",
      "options": [
        {
          "key": "A",
          "text": "True"
        },
        {
          "key": "B",
          "text": "False"
        },
        {
          "key": "C",
          "text": "Can't tell"
        }
      ],
      "answer": "B",
      "explanation": "Staff checked volunteer descriptions against original records before publishing, so this statement contradicts the passage.",
      "tags": [
        "medium"
      ],
      "setId": "vr-coastal-archive-oct26"
    },
    {
      "id": "vr-reviewed-oct26-04",
      "section": "vr",
      "subtype": "vr-tfc",
      "title": "Practice",
      "stimulus": [
        "A coastal archive moved its photographic collection into a searchable catalogue. Before the move, visitors could request only photographs whose dates they already knew. The new catalogue also allows searches by place and subject. Volunteers supplied descriptions, which staff checked against the original records before publishing.",
        "During the first six months, remote enquiries increased while visits to the reading room stayed broadly unchanged. The archive did not charge for searches, but high-resolution reproductions continued to attract a fee. Staff cautioned that the rise in remote enquiries could partly reflect a local history festival held during the same period."
      ],
      "question": "The local history festival lasted six months. According to the passage, this statement is:",
      "options": [
        {
          "key": "A",
          "text": "True"
        },
        {
          "key": "B",
          "text": "False"
        },
        {
          "key": "C",
          "text": "Can't tell"
        }
      ],
      "answer": "C",
      "explanation": "The six months describes the observation period. The festival occurred during that period, but its duration is not given.",
      "tags": [
        "medium"
      ],
      "setId": "vr-coastal-archive-oct26"
    }
  ],
  "dm": [
    {
      "id": "dm-reviewed-oct26-01",
      "section": "dm",
      "subtype": "dm-venn-sets",
      "title": "Practice",
      "stimulus": [
        "Of 48 volunteers, 26 chose gardening, 19 chose litter collection, and 8 chose both activities."
      ],
      "question": "How many volunteers chose neither activity?",
      "options": [
        {
          "key": "A",
          "text": "8"
        },
        {
          "key": "B",
          "text": "11"
        },
        {
          "key": "C",
          "text": "15"
        },
        {
          "key": "D",
          "text": "19"
        }
      ],
      "answer": "B",
      "explanation": "The union is 26 + 19 - 8 = 37. Subtracting from 48 leaves 11 who chose neither.",
      "tags": [
        "medium"
      ]
    },
    {
      "id": "dm-reviewed-oct26-02",
      "section": "dm",
      "subtype": "dm-probability-data",
      "title": "Practice",
      "stimulus": [
        "A pouch contains 4 brass tokens and 5 wooden tokens. Two tokens are selected at random without replacement."
      ],
      "question": "What is the probability of selecting two brass tokens?",
      "options": [
        {
          "key": "A",
          "text": "1/9"
        },
        {
          "key": "B",
          "text": "1/6"
        },
        {
          "key": "C",
          "text": "2/9"
        },
        {
          "key": "D",
          "text": "1/3"
        }
      ],
      "answer": "B",
      "explanation": "There are 4 brass tokens among 9. Without replacement the probability is (4/9) x (3/8) = 12/72 = 1/6.",
      "tags": [
        "medium"
      ]
    },
    {
      "id": "dm-reviewed-oct26-03",
      "section": "dm",
      "subtype": "dm-logic",
      "title": "Practice",
      "stimulus": [
        "Four tasks occupy four consecutive slots, one task per slot. Mounting is before labelling. Framing is immediately after labelling. Packing is after framing."
      ],
      "question": "Which task must be second?",
      "options": [
        {
          "key": "A",
          "text": "Framing"
        },
        {
          "key": "B",
          "text": "Mounting"
        },
        {
          "key": "C",
          "text": "Labelling"
        },
        {
          "key": "D",
          "text": "Packing"
        }
      ],
      "answer": "C",
      "explanation": "Framing must immediately follow labelling. It cannot be second because mounting would then have no earlier slot. Framing is third, labelling second, mounting first and packing fourth.",
      "tags": [
        "medium"
      ]
    }
  ],
  "qr": [
    {
      "id": "qr-reviewed-oct26-01",
      "section": "qr",
      "subtype": "qr-percentages",
      "title": "Practice",
      "stimulus": [
        "A repair workshop serviced 160 bicycles in April and 200 in May. In May, 35% of the bicycles needed new tyres. Each tyre replacement cost the customer GBP 24. The workshop paid GBP 15 for each replacement, with no other costs included in this calculation."
      ],
      "question": "What was the percentage increase in bicycles serviced from April to May?",
      "options": [
        {
          "key": "A",
          "text": "20%"
        },
        {
          "key": "B",
          "text": "25%"
        },
        {
          "key": "C",
          "text": "30%"
        },
        {
          "key": "D",
          "text": "40%"
        },
        {
          "key": "E",
          "text": "80%"
        }
      ],
      "answer": "B",
      "explanation": "The increase is 200 - 160 = 40. Relative to April, 40/160 x 100 = 25%.",
      "tags": [
        "medium"
      ],
      "setId": "qr-cycle-workshop-oct26"
    },
    {
      "id": "qr-reviewed-oct26-02",
      "section": "qr",
      "subtype": "qr-percentages",
      "title": "Practice",
      "stimulus": [
        "A repair workshop serviced 160 bicycles in April and 200 in May. In May, 35% of the bicycles needed new tyres. Each tyre replacement cost the customer GBP 24. The workshop paid GBP 15 for each replacement, with no other costs included in this calculation."
      ],
      "question": "How many bicycles needed new tyres in May?",
      "options": [
        {
          "key": "A",
          "text": "35"
        },
        {
          "key": "B",
          "text": "56"
        },
        {
          "key": "C",
          "text": "65"
        },
        {
          "key": "D",
          "text": "70"
        },
        {
          "key": "E",
          "text": "130"
        }
      ],
      "answer": "D",
      "explanation": "35% of 200 = 0.35 x 200 = 70 bicycles.",
      "tags": [
        "medium"
      ],
      "setId": "qr-cycle-workshop-oct26"
    },
    {
      "id": "qr-reviewed-oct26-03",
      "section": "qr",
      "subtype": "qr-rates-ratios",
      "title": "Practice",
      "stimulus": [
        "A repair workshop serviced 160 bicycles in April and 200 in May. In May, 35% of the bicycles needed new tyres. Each tyre replacement cost the customer GBP 24. The workshop paid GBP 15 for each replacement, with no other costs included in this calculation."
      ],
      "question": "What was the total customer charge for tyre replacements in May?",
      "options": [
        {
          "key": "A",
          "text": "GBP 840"
        },
        {
          "key": "B",
          "text": "GBP 1050"
        },
        {
          "key": "C",
          "text": "GBP 1440"
        },
        {
          "key": "D",
          "text": "GBP 1680"
        },
        {
          "key": "E",
          "text": "GBP 4800"
        }
      ],
      "answer": "D",
      "explanation": "There were 70 replacements. The total charge is 70 x GBP 24 = GBP 1680.",
      "tags": [
        "medium"
      ],
      "setId": "qr-cycle-workshop-oct26"
    },
    {
      "id": "qr-reviewed-oct26-04",
      "section": "qr",
      "subtype": "qr-percentages",
      "title": "Practice",
      "stimulus": [
        "A repair workshop serviced 160 bicycles in April and 200 in May. In May, 35% of the bicycles needed new tyres. Each tyre replacement cost the customer GBP 24. The workshop paid GBP 15 for each replacement, with no other costs included in this calculation."
      ],
      "question": "What percentage of each tyre replacement charge remained after its stated cost?",
      "options": [
        {
          "key": "A",
          "text": "25%"
        },
        {
          "key": "B",
          "text": "37.5%"
        },
        {
          "key": "C",
          "text": "40%"
        },
        {
          "key": "D",
          "text": "60%"
        },
        {
          "key": "E",
          "text": "62.5%"
        }
      ],
      "answer": "B",
      "explanation": "The amount remaining is 24 - 15 = GBP 9. As a percentage of the charge, 9/24 x 100 = 37.5%.",
      "tags": [
        "medium"
      ],
      "setId": "qr-cycle-workshop-oct26"
    }
  ],
  "sjt": [
    {
      "id": "sjt-reviewed-oct26-01",
      "section": "sjt",
      "subtype": "sjt-appropriateness",
      "title": "Practice",
      "stimulus": [
        "You are a student helping to organise a university revision session. A classmate privately tells you that they find speaking in front of the group difficult. They ask you not to share this information with other students. They still want to contribute to the session."
      ],
      "question": "Privately ask the classmate which part of the session they would feel comfortable helping with.",
      "options": [
        {
          "key": "A",
          "text": "A very appropriate thing to do"
        },
        {
          "key": "B",
          "text": "Appropriate, but not ideal"
        },
        {
          "key": "C",
          "text": "Inappropriate, but not awful"
        },
        {
          "key": "D",
          "text": "A very inappropriate thing to do"
        }
      ],
      "answer": "A",
      "explanation": "This respects their privacy and preferences while enabling a meaningful contribution. It avoids assuming that they cannot participate.",
      "tags": [
        "medium"
      ],
      "setId": "sjt-revision-session-oct26",
      "issueTags": [
        "communication",
        "respect-dignity",
        "teamwork"
      ]
    },
    {
      "id": "sjt-reviewed-oct26-02",
      "section": "sjt",
      "subtype": "sjt-appropriateness",
      "title": "Practice",
      "stimulus": [
        "You are a student helping to organise a university revision session. A classmate privately tells you that they find speaking in front of the group difficult. They ask you not to share this information with other students. They still want to contribute to the session."
      ],
      "question": "Tell the whole group about the classmate's difficulty so that everyone knows why they are not presenting.",
      "options": [
        {
          "key": "A",
          "text": "A very appropriate thing to do"
        },
        {
          "key": "B",
          "text": "Appropriate, but not ideal"
        },
        {
          "key": "C",
          "text": "Inappropriate, but not awful"
        },
        {
          "key": "D",
          "text": "A very inappropriate thing to do"
        }
      ],
      "answer": "D",
      "explanation": "Sharing the private disclosure against an explicit request undermines trust. There is no stated safety concern that would justify telling the group.",
      "tags": [
        "medium"
      ],
      "setId": "sjt-revision-session-oct26",
      "issueTags": [
        "confidentiality",
        "respect-dignity"
      ]
    },
    {
      "id": "sjt-reviewed-oct26-03",
      "section": "sjt",
      "subtype": "sjt-importance",
      "title": "Practice",
      "stimulus": [
        "You are a student helping to organise a university revision session. A classmate privately tells you that they find speaking in front of the group difficult. They ask you not to share this information with other students. They still want to contribute to the session."
      ],
      "question": "The classmate still wants to contribute to the revision session.",
      "options": [
        {
          "key": "A",
          "text": "Very important"
        },
        {
          "key": "B",
          "text": "Important"
        },
        {
          "key": "C",
          "text": "Of minor importance"
        },
        {
          "key": "D",
          "text": "Not important at all"
        }
      ],
      "answer": "A",
      "explanation": "Their wish to contribute is central to deciding an inclusive response. Support should help them participate in a way they find manageable.",
      "tags": [
        "medium"
      ],
      "setId": "sjt-revision-session-oct26",
      "issueTags": [
        "teamwork",
        "respect-dignity"
      ]
    }
  ]
} satisfies Record<UCATSection, UCATQuestion[]>;
