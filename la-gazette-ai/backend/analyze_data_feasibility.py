
import os
from supabase import create_client
from dotenv import load_dotenv
import re
from collections import Counter

load_dotenv()

def analyze():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    supabase = create_client(url, key)

    print("--- Feasibility Analysis ---")

    # 1. Budget Feasibility (Amounts)
    print("\n1. Budget / Financial Data:")
    # Regex for LBP or USD amounts (e.g., 1,000,000 L.L., $500)
    # Arabic: ل.ل., ليرة لبنانية, دولار
    # English: LBP, USD, $, LL
    amount_pattern = re.compile(r'(\d{1,3}(?:[.,]\d{3})*(?:\.\d+)?)\s*(?:ل\.ل\.|ليرة|L\.L\.|LBP|\$|USD|دولار)')
    
    # Sample 100 units
    res = supabase.table("legal_units").select("id, title, content").limit(100).execute()
    
    amount_count = 0
    total_value = 0
    
    for row in res.data:
        content = row.get('content') or ""
        matches = amount_pattern.findall(content)
        if matches:
            amount_count += 1
            # print(f"  Found amounts in: {row['title'][:50]}... -> {matches[:3]}")

    print(f"  Units with financial amounts: {amount_count}/100")
    if amount_count < 10:
        print("  WARNING: Low financial data density. Budget Treemap might be sparse.")
    else:
        print("  GOOD: Financial data available.")

    # 2. Regional Map Feasibility
    print("\n2. Regional Data:")
    # List of Mohafazat/Cazas
    regions = {
        "Beirut": ["Beirut", "بيروت"],
        "Mount Lebanon": ["Baabda", "Metn", "Chouf", "Aley", "Kesrouan", "Jbeil", "بعبدا", "المتن", "الشوف", "عاليه", "كسروان", "جبيل", "جبل لبنان"],
        "North": ["Tripoli", "Koura", "Zgharta", "Batroun", "Bcharre", "Akkar", "Minieh-Dannieh", "طرابلس", "الكورة", "زغرتا", "البترون", "بشري", "عكار", "المنية", "الضنية", "الشمال"],
        "South": ["Sidon", "Tyre", "Jezzine", "Saida", "Sour", "صيدا", "صور", "جزين", "الجنوب"],
        "Bekaa": ["Zahle", "Baalbek", "Hermel", "Rashaya", "West Bekaa", "زحلة", "بعلبك", "الهرمل", "راشيا", "البقاع الغربي", "البقاع"],
        "Nabatieh": ["Nabatieh", "Marjaayoun", "Hasbaya", "Bint Jbeil", "النبطية", "مرجعيون", "حاصبيا", "بنت جبيل"]
    }
    
    # Flatten list
    region_keywords = set()
    for k, v in regions.items():
        for r in v:
            region_keywords.add(r)
            
    # Check entities
    # Fetch top location entities
    loc_res = supabase.table("entities").select("name, count").eq("type", "LOC").limit(100).execute()
    # Note: entities table doesn't have count yet (schema implies it might, but our model has it, DB has it?)
    # DB schema has 'description' not count.
    # We will just check existence of these names in 'entities' table.
    
    loc_res = supabase.table("entities").select("name").eq("type", "LOC").limit(200).execute()
    found_regions = Counter()
    
    for row in loc_res.data:
        name = row['name']
        # Check against regions
        for region_name in region_keywords:
            if region_name in name: # substring match
                found_regions[region_name] += 1
                
    print(f"  Found {sum(found_regions.values())} region matches in top 200 Location entities.")
    print(f"  Top regions: {found_regions.most_common(5)}")

    # 3. Legislative Journey
    print("\n3. Legislative Journey:")
    keywords = ["اقتراح قانون", "مشروع قانون", "أحيل إلى", "مجلس النواب", "لجنة الإدارة", "مرسوم جمهوري", "Draft Law", "Proposal", "Parliament"]
    
    journey_count = 0
    for row in res.data:
        content = row.get('content') or ""
        if any(k in content for k in keywords):
            journey_count += 1
            
    print(f"  Units with legislative keywords: {journey_count}/100")

if __name__ == "__main__":
    analyze()
