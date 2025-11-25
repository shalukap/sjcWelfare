<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Due Report</title>
    @vite('resources/css/app.css')
</head>
<body>
    <h1 class="text-lg font-bold text-black text-center">St Joseph's College Facility fees</h1>
    <h3 class="text-sm font-bold text-black text-center">Due report for Grade :-{{$grade}}, Class:-{{$class}}</h3>
    <p class="text-sm font-bold text-black">Date - {{now()->format('Y-m-d')}}</p>
    <hr class="mt-5 border-black">
    @foreach($studentGroups as $className => $studentsWithDue)
    <h1 class="text-lg font-bold text-black underline mt-5">{{$className}}</h1>
    <table class="w-full text-black m-3 text-sm">
        <thead class="bg-black text-sm text-white ">
        <tr class="border-b">
            <th>Admission number</th>
            <th>Student Name</th>
            <th>Class</th>
            
            <th>Due Amount</th>
        </tr>
        </thead>
        <tbody>
            
            @foreach ($studentsWithDue as $student)           
                <tr class="odd:bg-white even:bg-gray-100 text-center">
                    <td>{{$student->admission_number??'N/A'}}</td>
                    <td>{{$student->name??'N/A'}}</td>
                    <td>{{$student->current_class??'N/A'}}</td>                    
                    <td>{{number_format($student->due_amount,2)??'N/A'}}</td>
                </tr>
            @endforeach
           
        </tbody>
        <tbody>
            
           
    </table>  
     @endforeach  
</body>
</html>